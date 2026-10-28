const mongoose = require('mongoose');
const { Student, Course, ActivityLog, Notification } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Enrollment Controller
 * 
 * Demonstrates:
 * - MongoDB Transactions
 * - ACID properties
 * - Session handling
 * - Rollback on error
 * - Multi-document operations
 */

// @desc    Enroll student in course (with transaction)
// @route   POST /api/enrollment
// @access  Private
exports.enrollStudent = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.body;

  // Start a session for transaction
  const session = await mongoose.startSession();
  
  try {
    // Start transaction
    session.startTransaction();

    // Step 1: Find student
    const student = await Student.findById(studentId).session(session);
    if (!student) {
      throw new Error('Student not found');
    }

    // Step 2: Find course
    const course = await Course.findById(courseId)
      .populate('faculty')
      .session(session);
    
    if (!course) {
      throw new Error('Course not found');
    }

    // Step 3: Check if course is full
    if (course.isFull()) {
      throw new Error('Course is full');
    }

    // Step 4: Check if already enrolled
    if (student.enrolledCourses.includes(courseId)) {
      throw new Error('Student already enrolled in this course');
    }

    // Step 5: Check if same semester
    if (course.semester !== student.semester) {
      throw new Error('Course semester does not match student semester');
    }

    // Step 6: Add course to student's enrolled courses
    student.enrolledCourses.push(courseId);
    
    // Add attendance record for the course
    student.attendance.push({
      courseId: course._id,
      courseName: course.courseName,
      totalClasses: 0,
      attendedClasses: 0,
      percentage: 0
    });
    
    await student.save({ session });

    // Step 7: Add student to course's enrolled students
    course.enrolledStudents.push(studentId);
    await course.save({ session });

    // Step 8: Create activity log
    await ActivityLog.create([{
      user: {
        userId: student._id,
        userType: 'Student',
        name: student.name,
        email: student.email
      },
      action: 'Enroll',
      entity: 'Course',
      entityId: course._id,
      description: `${student.name} enrolled in ${course.courseName}`,
      status: 'Success',
      metadata: {
        courseId: course._id,
        courseName: course.courseName,
        courseCode: course.courseCode,
        studentId: student._id,
        studentName: student.name
      }
    }], { session });

    // Step 9: Create notification for student
    await Notification.create([{
      title: 'Course Enrollment Successful',
      message: `You have been successfully enrolled in ${course.courseName} (${course.courseCode})`,
      type: 'Success',
      category: 'Academic',
      recipient: {
        userId: student._id,
        userType: 'Student'
      },
      sender: {
        userId: course.faculty._id,
        userType: 'Faculty',
        name: course.faculty.name
      },
      priority: 'High'
    }], { session });

    // Commit transaction - all operations succeed together
    await session.commitTransaction();
    
    console.log('✅ Transaction committed successfully');

    res.status(200).json({
      success: true,
      message: 'Student enrolled successfully',
      data: {
        student: {
          id: student._id,
          name: student.name,
          studentId: student.studentId
        },
        course: {
          id: course._id,
          name: course.courseName,
          code: course.courseCode
        },
        enrollmentCount: course.enrolledStudents.length
      }
    });

  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    console.log('❌ Transaction aborted:', error.message);
    
    // Log failed activity
    await ActivityLog.create({
      user: {
        userId: req.body.studentId,
        userType: 'Student'
      },
      action: 'Enroll',
      entity: 'Course',
      description: `Failed enrollment attempt`,
      status: 'Failure',
      errorMessage: error.message
    });

    res.status(400).json({
      success: false,
      error: error.message || 'Enrollment failed'
    });
    
  } finally {
    // End session
    session.endSession();
  }
});

// @desc    Unenroll student from course (with transaction)
// @route   DELETE /api/enrollment
// @access  Private
exports.unenrollStudent = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.body;

  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Remove course from student
    const student = await Student.findByIdAndUpdate(
      studentId,
      {
        $pull: {
          enrolledCourses: courseId,
          attendance: { courseId: courseId }
        }
      },
      { new: true, session }
    );

    if (!student) {
      throw new Error('Student not found');
    }

    // Remove student from course
    const course = await Course.findByIdAndUpdate(
      courseId,
      {
        $pull: {
          enrolledStudents: studentId
        }
      },
      { new: true, session }
    );

    if (!course) {
      throw new Error('Course not found');
    }

    // Log activity
    await ActivityLog.create([{
      user: {
        userId: student._id,
        userType: 'Student',
        name: student.name,
        email: student.email
      },
      action: 'Delete',
      entity: 'Course',
      entityId: course._id,
      description: `${student.name} unenrolled from ${course.courseName}`,
      status: 'Success'
    }], { session });

    // Commit transaction
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Student unenrolled successfully',
      data: {
        student: student.name,
        course: course.courseName
      }
    });

  } catch (error) {
    await session.abortTransaction();
    
    res.status(400).json({
      success: false,
      error: error.message || 'Unenrollment failed'
    });
    
  } finally {
    session.endSession();
  }
});

// @desc    Get enrollment statistics
// @route   GET /api/enrollment/stats
// @access  Public
exports.getEnrollmentStats = asyncHandler(async (req, res) => {
  const stats = await Course.aggregate([
    {
      $project: {
        courseName: 1,
        courseCode: 1,
        department: 1,
        semester: 1,
        maxCapacity: 1,
        enrollmentCount: { $size: '$enrolledStudents' },
        availableSeats: {
          $subtract: ['$maxCapacity', { $size: '$enrolledStudents' }]
        },
        occupancyRate: {
          $multiply: [
            {
              $divide: [
                { $size: '$enrolledStudents' },
                '$maxCapacity'
              ]
            },
            100
          ]
        }
      }
    },
    {
      $sort: { occupancyRate: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    count: stats.length,
    data: stats
  });
});
