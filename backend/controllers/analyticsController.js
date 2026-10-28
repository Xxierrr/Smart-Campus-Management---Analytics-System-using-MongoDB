const { Student, Course, Result, Attendance, Assignment, Event, ActivityLog } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Analytics Controller
 * 
 * Demonstrates:
 * - Aggregation Framework
 * - $match, $group, $project, $sort, $limit
 * - $lookup (joins)
 * - $unwind
 * - $facet
 * - Complex pipelines
 */

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Public
exports.getDashboardStats = asyncHandler(async (req, res) => {
  // Use $facet to get multiple analytics in one query
  const stats = await Student.aggregate([
    {
      $facet: {
        totalStudents: [
          { $match: { isActive: true } },
          { $count: 'count' }
        ],
        departmentWise: [
          { $match: { isActive: true } },
          {
            $group: {
              _id: '$department',
              count: { $sum: 1 },
              avgCGPA: { $avg: '$cgpa' }
            }
          },
          { $sort: { count: -1 } }
        ],
        semesterWise: [
          { $match: { isActive: true } },
          {
            $group: {
              _id: '$semester',
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ],
        topPerformers: [
          { $match: { isActive: true, cgpa: { $gt: 0 } } },
          { $sort: { cgpa: -1 } },
          { $limit: 10 },
          {
            $project: {
              studentId: 1,
              name: 1,
              department: 1,
              semester: 1,
              cgpa: 1
            }
          }
        ]
      }
    }
  ]);

  // Get faculty and course counts
  const [facultyCount, courseCount, eventCount] = await Promise.all([
    require('../models').Faculty.countDocuments({ isActive: true }),
    Course.countDocuments({ isActive: true }),
    Event.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } })
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalStudents: stats[0].totalStudents[0]?.count || 0,
      totalFaculty: facultyCount,
      totalCourses: courseCount,
      upcomingEvents: eventCount,
      departmentWise: stats[0].departmentWise,
      semesterWise: stats[0].semesterWise,
      topPerformers: stats[0].topPerformers
    }
  });
});

// @desc    Get attendance analytics
// @route   GET /api/analytics/attendance
// @access  Public
exports.getAttendanceAnalytics = asyncHandler(async (req, res) => {
  // Department-wise attendance aggregation
  const departmentWise = await Student.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$attendance' }, // $unwind array
    {
      $group: {
        _id: '$department',
        totalStudents: { $addToSet: '$_id' },
        avgAttendance: { $avg: '$attendance.percentage' },
        minAttendance: { $min: '$attendance.percentage' },
        maxAttendance: { $max: '$attendance.percentage' }
      }
    },
    {
      $project: {
        department: '$_id',
        studentCount: { $size: '$totalStudents' },
        avgAttendance: { $round: ['$avgAttendance', 2] },
        minAttendance: { $round: ['$minAttendance', 2] },
        maxAttendance: { $round: ['$maxAttendance', 2] }
      }
    },
    { $sort: { avgAttendance: -1 } }
  ]);

  // Students below 75% attendance
  const lowAttendance = await Student.aggregate([
    { $match: { isActive: true } },
    { $unwind: '$attendance' },
    {
      $group: {
        _id: '$_id',
        studentId: { $first: '$studentId' },
        name: { $first: '$name' },
        department: { $first: '$department' },
        semester: { $first: '$semester' },
        avgAttendance: { $avg: '$attendance.percentage' }
      }
    },
    {
      $match: {
        avgAttendance: { $lt: 75 }
      }
    },
    { $sort: { avgAttendance: 1 } },
    { $limit: 50 }
  ]);

  // Course-wise attendance
  const courseWise = await Attendance.aggregate([
    {
      $group: {
        _id: '$course',
        courseName: { $first: '$courseName' },
        totalClasses: { $sum: 1 },
        avgAttendance: { $avg: '$attendancePercentage' },
        totalPresent: { $sum: '$presentCount' },
        totalAbsent: { $sum: '$absentCount' }
      }
    },
    {
      $project: {
        courseName: 1,
        totalClasses: 1,
        avgAttendance: { $round: ['$avgAttendance', 2] },
        totalPresent: 1,
        totalAbsent: 1
      }
    },
    { $sort: { avgAttendance: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      departmentWise,
      lowAttendance,
      courseWise
    }
  });
});

// @desc    Get result analytics
// @route   GET /api/analytics/results
// @access  Public
exports.getResultAnalytics = asyncHandler(async (req, res) => {
  const { semester, department, academicYear } = req.query;

  let matchStage = {};
  if (semester) matchStage.semester = parseInt(semester);
  if (department) matchStage.department = department;
  if (academicYear) matchStage.academicYear = academicYear;

  // Grade distribution
  const gradeDistribution = await Result.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$grade',
        count: { $sum: 1 },
        avgPercentage: { $avg: '$percentage' }
      }
    },
    {
      $project: {
        grade: '$_id',
        count: 1,
        avgPercentage: { $round: ['$avgPercentage', 2] }
      }
    },
    { $sort: { grade: 1 } }
  ]);

  // Course-wise performance
  const courseWisePerformance = await Result.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$course',
        courseName: { $first: '$courseName' },
        courseCode: { $first: '$courseCode' },
        totalStudents: { $sum: 1 },
        avgMarks: { $avg: '$totalObtained' },
        avgPercentage: { $avg: '$percentage' },
        passCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Pass'] }, 1, 0]
          }
        },
        failCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Fail'] }, 1, 0]
          }
        },
        highestMarks: { $max: '$totalObtained' },
        lowestMarks: { $min: '$totalObtained' }
      }
    },
    {
      $project: {
        courseName: 1,
        courseCode: 1,
        totalStudents: 1,
        avgMarks: { $round: ['$avgMarks', 2] },
        avgPercentage: { $round: ['$avgPercentage', 2] },
        passCount: 1,
        failCount: 1,
        passPercentage: {
          $round: [
            { $multiply: [{ $divide: ['$passCount', '$totalStudents'] }, 100] },
            2
          ]
        },
        highestMarks: 1,
        lowestMarks: 1
      }
    },
    { $sort: { avgPercentage: -1 } }
  ]);

  // Top performers
  const topPerformers = await Result.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$student',
        studentName: { $first: '$studentName' },
        studentRollNo: { $first: '$studentRollNo' },
        department: { $first: '$department' },
        avgPercentage: { $avg: '$percentage' },
        totalCourses: { $sum: 1 }
      }
    },
    { $match: { totalCourses: { $gte: 3 } } },
    { $sort: { avgPercentage: -1 } },
    { $limit: 10 },
    {
      $project: {
        studentName: 1,
        studentRollNo: 1,
        department: 1,
        avgPercentage: { $round: ['$avgPercentage', 2] },
        totalCourses: 1
      }
    }
  ]);

  // Department-wise performance
  const departmentWise = await Result.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$department',
        totalStudents: { $addToSet: '$student' },
        avgPercentage: { $avg: '$percentage' },
        passCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Pass'] }, 1, 0]
          }
        },
        totalResults: { $sum: 1 }
      }
    },
    {
      $project: {
        department: '$_id',
        studentCount: { $size: '$totalStudents' },
        avgPercentage: { $round: ['$avgPercentage', 2] },
        passPercentage: {
          $round: [
            { $multiply: [{ $divide: ['$passCount', '$totalResults'] }, 100] },
            2
          ]
        }
      }
    },
    { $sort: { avgPercentage: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      gradeDistribution,
      courseWisePerformance,
      topPerformers,
      departmentWise
    }
  });
});

// @desc    Get student performance with courses using $lookup
// @route   GET /api/analytics/student-performance/:id
// @access  Public
exports.getStudentPerformance = asyncHandler(async (req, res) => {
  // $lookup demonstration - joining Student and Result collections
  const performance = await Student.aggregate([
    {
      $match: {
        _id: require('mongoose').Types.ObjectId(req.params.id)
      }
    },
    {
      $lookup: {
        from: 'results', // Target collection
        localField: '_id',
        foreignField: 'student',
        as: 'results' // Output array field
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'enrolledCourses',
        foreignField: '_id',
        as: 'courseDetails'
      }
    },
    {
      $project: {
        studentId: 1,
        name: 1,
        email: 1,
        department: 1,
        semester: 1,
        cgpa: 1,
        results: 1,
        courseDetails: {
          courseName: 1,
          courseCode: 1,
          credits: 1
        },
        totalResults: { $size: '$results' },
        avgPercentage: { $avg: '$results.percentage' }
      }
    }
  ]);

  if (!performance || performance.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }

  res.status(200).json({
    success: true,
    data: performance[0]
  });
});

// @desc    Get assignment analytics
// @route   GET /api/analytics/assignments
// @access  Public
exports.getAssignmentAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Assignment.aggregate([
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              totalAssignments: { $sum: 1 },
              totalSubmissions: { $sum: '$totalSubmissions' },
              avgSubmissionRate: {
                $avg: {
                  $cond: [
                    { $gt: [{ $size: '$submissions' }, 0] },
                    {
                      $multiply: [
                        {
                          $divide: [
                            '$totalSubmissions',
                            { $size: '$submissions' }
                          ]
                        },
                        100
                      ]
                    },
                    0
                  ]
                }
              }
            }
          }
        ],
        departmentWise: [
          {
            $group: {
              _id: '$department',
              totalAssignments: { $sum: 1 },
              totalSubmissions: { $sum: '$totalSubmissions' },
              pendingSubmissions: { $sum: '$pendingSubmissions' }
            }
          },
          { $sort: { totalAssignments: -1 } }
        ],
        recentAssignments: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              courseName: 1,
              department: 1,
              dueDate: 1,
              totalSubmissions: 1,
              maxMarks: 1
            }
          }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: analytics[0]
  });
});

// @desc    Get event analytics
// @route   GET /api/analytics/events
// @access  Public
exports.getEventAnalytics = asyncHandler(async (req, res) => {
  const analytics = await Event.aggregate([
    {
      $facet: {
        categoryWise: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              totalParticipants: {
                $sum: { $size: '$participants' }
              },
              avgParticipants: {
                $avg: { $size: '$participants' }
              }
            }
          },
          { $sort: { count: -1 } }
        ],
        statusWise: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        upcoming: [
          {
            $match: {
              status: 'Upcoming',
              eventDate: { $gte: new Date() }
            }
          },
          { $sort: { eventDate: 1 } },
          { $limit: 10 },
          {
            $project: {
              title: 1,
              category: 1,
              eventDate: 1,
              venue: 1,
              participantCount: { $size: '$participants' },
              maxParticipants: 1
            }
          }
        ],
        monthlyTrend: [
          {
            $group: {
              _id: {
                year: { $year: '$eventDate' },
                month: { $month: '$eventDate' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: analytics[0]
  });
});

// @desc    Get activity logs analytics
// @route   GET /api/analytics/activity
// @access  Public
exports.getActivityAnalytics = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const analytics = await ActivityLog.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate }
      }
    },
    {
      $facet: {
        actionWise: [
          {
            $group: {
              _id: '$action',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],
        entityWise: [
          {
            $group: {
              _id: '$entity',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ],
        userTypeWise: [
          {
            $group: {
              _id: '$user.userType',
              count: { $sum: 1 }
            }
          }
        ],
        dailyActivity: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$timestamp'
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ],
        recentActivity: [
          { $sort: { timestamp: -1 } },
          { $limit: 20 },
          {
            $project: {
              action: 1,
              entity: 1,
              description: 1,
              userName: '$user.name',
              userType: '$user.userType',
              timestamp: 1,
              status: 1
            }
          }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: analytics[0]
  });
});
