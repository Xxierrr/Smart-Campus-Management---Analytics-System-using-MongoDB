/**
 * MongoDB Aggregation Framework Demonstration
 * 
 * Demonstrates powerful aggregation pipelines
 * This is one of the most important MongoDB features
 */

use smart_campus

// ========================================
// BASIC AGGREGATION STAGES
// ========================================

// 1. $match - Filter documents (like find())
db.students.aggregate([
  {
    $match: {
      department: "CSE",
      isActive: true
    }
  }
])

// 2. $project - Select/compute fields
db.students.aggregate([
  {
    $project: {
      name: 1,
      studentId: 1,
      department: 1,
      cgpa: 1,
      _id: 0
    }
  }
])

// 3. $group - Group documents and perform calculations
db.students.aggregate([
  {
    $group: {
      _id: "$department",  // Group by department
      totalStudents: { $sum: 1 },
      avgCGPA: { $avg: "$cgpa" },
      maxCGPA: { $max: "$cgpa" },
      minCGPA: { $min: "$cgpa" }
    }
  }
])

// 4. $sort - Sort documents
db.students.aggregate([
  {
    $match: { department: "CSE" }
  },
  {
    $sort: { cgpa: -1 }  // Descending order
  }
])

// 5. $limit - Limit number of documents
db.students.aggregate([
  {
    $sort: { cgpa: -1 }
  },
  {
    $limit: 10  // Top 10 students
  }
])

// 6. $skip - Skip documents
db.students.aggregate([
  {
    $sort: { cgpa: -1 }
  },
  {
    $skip: 10
  },
  {
    $limit: 10  // Pagination: page 2
  }
])

// ========================================
// ADVANCED AGGREGATION
// ========================================

// 7. $unwind - Deconstruct array field
db.students.aggregate([
  {
    $unwind: "$skills"  // One document per skill
  },
  {
    $group: {
      _id: "$skills",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
])

// 8. $lookup - Join collections (like SQL JOIN)
db.students.aggregate([
  {
    $lookup: {
      from: "results",           // Target collection
      localField: "_id",          // Field from students
      foreignField: "student",    // Field from results
      as: "studentResults"        // Output array field
    }
  },
  {
    $limit: 5
  }
])

// 9. $addFields - Add new computed fields
db.students.aggregate([
  {
    $addFields: {
      fullInfo: {
        $concat: ["$name", " - ", "$studentId"]
      },
      isTopPerformer: {
        $gte: ["$cgpa", 8.5]
      }
    }
  },
  {
    $limit: 5
  }
])

// 10. $count - Count documents
db.students.aggregate([
  {
    $match: { department: "CSE" }
  },
  {
    $count: "totalCSEStudents"
  }
])

// ========================================
// REAL-WORLD ANALYTICS EXAMPLES
// ========================================

// 11. Department-wise Student Count and Average CGPA
db.students.aggregate([
  {
    $match: { isActive: true }
  },
  {
    $group: {
      _id: "$department",
      totalStudents: { $sum: 1 },
      avgCGPA: { $avg: "$cgpa" },
      maxCGPA: { $max: "$cgpa" },
      minCGPA: { $min: "$cgpa" }
    }
  },
  {
    $project: {
      department: "$_id",
      totalStudents: 1,
      avgCGPA: { $round: ["$avgCGPA", 2] },
      maxCGPA: { $round: ["$maxCGPA", 2] },
      minCGPA: { $round: ["$minCGPA", 2] },
      _id: 0
    }
  },
  {
    $sort: { avgCGPA: -1 }
  }
])

// 12. Top 10 Performing Students
db.results.aggregate([
  {
    $group: {
      _id: "$student",
      studentName: { $first: "$studentName" },
      studentRollNo: { $first: "$studentRollNo" },
      department: { $first: "$department" },
      avgPercentage: { $avg: "$percentage" },
      totalCourses: { $sum: 1 }
    }
  },
  {
    $match: {
      totalCourses: { $gte: 3 }
    }
  },
  {
    $sort: { avgPercentage: -1 }
  },
  {
    $limit: 10
  },
  {
    $project: {
      studentName: 1,
      studentRollNo: 1,
      department: 1,
      avgPercentage: { $round: ["$avgPercentage", 2] },
      totalCourses: 1,
      _id: 0
    }
  }
])

// 13. Course-wise Performance Analysis
db.results.aggregate([
  {
    $group: {
      _id: "$courseCode",
      courseName: { $first: "$courseName" },
      totalStudents: { $sum: 1 },
      avgMarks: { $avg: "$totalObtained" },
      avgPercentage: { $avg: "$percentage" },
      passCount: {
        $sum: {
          $cond: [{ $eq: ["$status", "Pass"] }, 1, 0]
        }
      },
      failCount: {
        $sum: {
          $cond: [{ $eq: ["$status", "Fail"] }, 1, 0]
        }
      }
    }
  },
  {
    $project: {
      courseCode: "$_id",
      courseName: 1,
      totalStudents: 1,
      avgMarks: { $round: ["$avgMarks", 2] },
      avgPercentage: { $round: ["$avgPercentage", 2] },
      passCount: 1,
      failCount: 1,
      passPercentage: {
        $round: [
          { $multiply: [{ $divide: ["$passCount", "$totalStudents"] }, 100] },
          2
        ]
      },
      _id: 0
    }
  },
  {
    $sort: { avgPercentage: -1 }
  }
])

// 14. Grade Distribution
db.results.aggregate([
  {
    $group: {
      _id: "$grade",
      count: { $sum: 1 },
      avgPercentage: { $avg: "$percentage" }
    }
  },
  {
    $project: {
      grade: "$_id",
      count: 1,
      avgPercentage: { $round: ["$avgPercentage", 2] },
      _id: 0
    }
  },
  {
    $sort: { grade: 1 }
  }
])

// 15. Students with Low Attendance (< 75%)
db.students.aggregate([
  {
    $match: { isActive: true }
  },
  {
    $unwind: "$attendance"
  },
  {
    $group: {
      _id: "$_id",
      studentId: { $first: "$studentId" },
      name: { $first: "$name" },
      department: { $first: "$department" },
      semester: { $first: "$semester" },
      avgAttendance: { $avg: "$attendance.percentage" }
    }
  },
  {
    $match: {
      avgAttendance: { $lt: 75 }
    }
  },
  {
    $project: {
      studentId: 1,
      name: 1,
      department: 1,
      semester: 1,
      avgAttendance: { $round: ["$avgAttendance", 2] },
      _id: 0
    }
  },
  {
    $sort: { avgAttendance: 1 }
  }
])

// 16. Most Popular Skills
db.students.aggregate([
  {
    $unwind: "$skills"
  },
  {
    $group: {
      _id: "$skills",
      studentCount: { $sum: 1 },
      students: { $push: "$name" }
    }
  },
  {
    $project: {
      skill: "$_id",
      studentCount: 1,
      studentNames: { $slice: ["$students", 5] },  // First 5 students
      _id: 0
    }
  },
  {
    $sort: { studentCount: -1 }
  },
  {
    $limit: 10
  }
])

// 17. Department-wise Attendance Analysis
db.students.aggregate([
  {
    $match: { isActive: true }
  },
  {
    $unwind: "$attendance"
  },
  {
    $group: {
      _id: "$department",
      totalStudents: { $addToSet: "$_id" },
      avgAttendance: { $avg: "$attendance.percentage" },
      minAttendance: { $min: "$attendance.percentage" },
      maxAttendance: { $max: "$attendance.percentage" }
    }
  },
  {
    $project: {
      department: "$_id",
      studentCount: { $size: "$totalStudents" },
      avgAttendance: { $round: ["$avgAttendance", 2] },
      minAttendance: { $round: ["$minAttendance", 2] },
      maxAttendance: { $round: ["$maxAttendance", 2] },
      _id: 0
    }
  },
  {
    $sort: { avgAttendance: -1 }
  }
])

// 18. Semester-wise Student Distribution
db.students.aggregate([
  {
    $match: { isActive: true }
  },
  {
    $group: {
      _id: "$semester",
      count: { $sum: 1 },
      departments: { $addToSet: "$department" },
      avgCGPA: { $avg: "$cgpa" }
  },
  {
    $project: {
      semester: "$_id",
      studentCount: "$count",
      departmentCount: { $size: "$departments" },
      avgCGPA: { $round: ["$avgCGPA", 2] },
      _id: 0
    }
  },
  {
    $sort: { semester: 1 }
  }
])

// 19. Event Category Analysis
db.events.aggregate([
  {
    $group: {
      _id: "$category",
      totalEvents: { $sum: 1 },
      totalParticipants: { $sum: { $size: "$participants" } },
      avgParticipants: { $avg: { $size: "$participants" } },
      upcomingCount: {
        $sum: {
          $cond: [{ $eq: ["$status", "Upcoming"] }, 1, 0]
        }
      }
    }
  },
  {
    $project: {
      category: "$_id",
      totalEvents: 1,
      totalParticipants: 1,
      avgParticipants: { $round: ["$avgParticipants", 0] },
      upcomingCount: 1,
      _id: 0
    }
  },
  {
    $sort: { totalEvents: -1 }
  }
])

// 20. Student Performance with Course Details ($lookup)
db.students.aggregate([
  {
    $match: { department: "CSE", semester: 5 }
  },
  {
    $lookup: {
      from: "results",
      localField: "_id",
      foreignField: "student",
      as: "results"
    }
  },
  {
    $lookup: {
      from: "courses",
      localField: "enrolledCourses",
      foreignField: "_id",
      as: "courses"
    }
  },
  {
    $project: {
      studentId: 1,
      name: 1,
      cgpa: 1,
      totalCourses: { $size: "$courses" },
      totalResults: { $size: "$results" },
      avgPercentage: { $avg: "$results.percentage" }
    }
  },
  {
    $sort: { avgPercentage: -1 }
  },
  {
    $limit: 10
  }
])

// ========================================
// $FACET - Multiple Pipelines
// ========================================

// 21. Multiple Analytics in One Query
db.students.aggregate([
  {
    $facet: {
      // Pipeline 1: Overall statistics
      overallStats: [
        {
          $match: { isActive: true }
        },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: 1 },
            avgCGPA: { $avg: "$cgpa" },
            avgSemester: { $avg: "$semester" }
          }
        }
      ],
      
      // Pipeline 2: Department-wise count
      departmentWise: [
        {
          $match: { isActive: true }
        },
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ],
      
      // Pipeline 3: Top performers
      topPerformers: [
        {
          $match: { isActive: true, cgpa: { $gt: 0 } }
        },
        {
          $sort: { cgpa: -1 }
        },
        {
          $limit: 5
        },
        {
          $project: {
            name: 1,
            studentId: 1,
            department: 1,
            cgpa: 1
          }
        }
      ],
      
      // Pipeline 4: CGPA ranges
      cgpaRanges: [
        {
          $bucket: {
            groupBy: "$cgpa",
            boundaries: [0, 6, 7, 8, 9, 10],
            default: "Other",
            output: {
              count: { $sum: 1 },
              students: { $push: "$name" }
            }
          }
        }
      ]
    }
  }
])

// ========================================
// $BUCKET - Group into ranges
// ========================================

// 22. Group students by CGPA ranges
db.students.aggregate([
  {
    $bucket: {
      groupBy: "$cgpa",
      boundaries: [0, 6, 7, 8, 9, 10],
      default: "Other",
      output: {
        count: { $sum: 1 },
        avgCGPA: { $avg: "$cgpa" },
        students: { $push: "$name" }
      }
    }
  }
])

// ========================================
// CONDITIONAL OPERATIONS
// ========================================

// 23. Categorize students based on CGPA
db.students.aggregate([
  {
    $project: {
      name: 1,
      studentId: 1,
      cgpa: 1,
      category: {
        $switch: {
          branches: [
            { case: { $gte: ["$cgpa", 9] }, then: "Excellent" },
            { case: { $gte: ["$cgpa", 8] }, then: "Very Good" },
            { case: { $gte: ["$cgpa", 7] }, then: "Good" },
            { case: { $gte: ["$cgpa", 6] }, then: "Average" }
          ],
          default: "Below Average"
        }
      }
    }
  },
  {
    $limit: 10
  }
])

// ========================================
// DATE AGGREGATION
// ========================================

// 24. Events by month
db.events.aggregate([
  {
    $group: {
      _id: {
        year: { $year: "$eventDate" },
        month: { $month: "$eventDate" }
      },
      count: { $sum: 1 },
      events: { $push: "$title" }
    }
  },
  {
    $sort: { "_id.year": -1, "_id.month": -1 }
  }
])

// ========================================
// ARRAY OPERATIONS
// ========================================

// 25. Course enrollment statistics
db.courses.aggregate([
  {
    $project: {
      courseName: 1,
      courseCode: 1,
      maxCapacity: 1,
      enrollmentCount: { $size: "$enrolledStudents" },
      availableSeats: {
        $subtract: ["$maxCapacity", { $size: "$enrolledStudents" }]
      },
      occupancyRate: {
        $multiply: [
          {
            $divide: [
              { $size: "$enrolledStudents" },
              "$maxCapacity"
            ]
          },
          100
        ]
      }
    }
  },
  {
    $match: {
      occupancyRate: { $gte: 50 }
    }
  },
  {
    $sort: { occupancyRate: -1 }
  }
])

// ========================================
// NOTES
// ========================================

/*
Aggregation Pipeline Stages:
- $match: Filter documents
- $project: Select/compute fields
- $group: Group and aggregate
- $sort: Sort documents
- $limit: Limit results
- $skip: Skip documents
- $unwind: Deconstruct arrays
- $lookup: Join collections
- $addFields: Add computed fields
- $count: Count documents
- $facet: Multiple pipelines
- $bucket: Group into ranges

Aggregation Operators:
- $sum, $avg, $min, $max: Arithmetic
- $first, $last: Get values
- $push, $addToSet: Array operations
- $cond, $switch: Conditional
- $concat, $substr: String operations
- $year, $month, $day: Date operations
- $size: Array size

Best Practices:
1. Use $match early to reduce documents
2. Use indexes on $match and $sort stages
3. Use $project to reduce document size
4. Use $limit after $sort for top-N queries
5. Use $facet for multiple analytics in one query
6. Use explain() to analyze performance
*/
