/**
 * MongoDB Transactions Demonstration
 * 
 * Demonstrates:
 * - Multi-document ACID transactions
 * - Session handling
 * - Commit and abort
 * - Error handling
 * - Transaction best practices
 * 
 * NOTE: Transactions require MongoDB Replica Set
 * For local development, you can create a single-node replica set
 */

// ========================================
// SETUP: Create Replica Set (One-time setup)
// ========================================

/*
To enable transactions locally:

1. Stop MongoDB if running
2. Start MongoDB as replica set:
   mongod --replSet rs0 --dbpath /path/to/data --port 27017

3. Initialize replica set in mongosh:
   rs.initiate()

4. Wait for it to become PRIMARY:
   rs.status()
*/

// ========================================
// TRANSACTION EXAMPLE 1: Student Enrollment
// ========================================

use smart_campus

// Start a session
var session = db.getMongo().startSession()

// Get database with session
var studentsCol = session.getDatabase("smart_campus").students
var coursesCol = session.getDatabase("smart_campus").courses
var activityCol = session.getDatabase("smart_campus").activity_logs

try {
  // Start transaction
  session.startTransaction()
  
  // Step 1: Find student
  var student = studentsCol.findOne(
    { studentId: "CSE2023001" },
    { session: session }
  )
  
  if (!student) {
    throw new Error("Student not found")
  }
  
  // Step 2: Find course
  var course = coursesCol.findOne(
    { courseId: "CS301" },
    { session: session }
  )
  
  if (!course) {
    throw new Error("Course not found")
  }
  
  // Step 3: Check if course is full
  if (course.enrolledStudents.length >= course.maxCapacity) {
    throw new Error("Course is full")
  }
  
  // Step 4: Check if already enrolled
  var alreadyEnrolled = student.enrolledCourses.some(function(courseId) {
    return courseId.equals(course._id)
  })
  
  if (alreadyEnrolled) {
    throw new Error("Student already enrolled in this course")
  }
  
  // Step 5: Add course to student's enrolledCourses
  studentsCol.updateOne(
    { _id: student._id },
    {
      $push: {
        enrolledCourses: course._id,
        attendance: {
          courseId: course._id,
          courseName: course.courseName,
          totalClasses: 0,
          attendedClasses: 0,
          percentage: 0
        }
      }
    },
    { session: session }
  )
  
  // Step 6: Add student to course's enrolledStudents
  coursesCol.updateOne(
    { _id: course._id },
    {
      $push: {
        enrolledStudents: student._id
      }
    },
    { session: session }
  )
  
  // Step 7: Log activity
  activityCol.insertOne(
    {
      user: {
        userId: student._id,
        userType: "Student",
        name: student.name,
        email: student.email
      },
      action: "Enroll",
      entity: "Course",
      entityId: course._id,
      description: student.name + " enrolled in " + course.courseName,
      status: "Success",
      timestamp: new Date()
    },
    { session: session }
  )
  
  // Commit transaction
  session.commitTransaction()
  print("✅ Transaction committed successfully")
  print("Student " + student.name + " enrolled in " + course.courseName)
  
} catch (error) {
  // Rollback transaction on error
  session.abortTransaction()
  print("❌ Transaction aborted: " + error.message)
  
} finally {
  // End session
  session.endSession()
}

// ========================================
// TRANSACTION EXAMPLE 2: Result Publishing
// ========================================

var session = db.getMongo().startSession()

try {
  session.startTransaction()
  
  var resultsCol = session.getDatabase("smart_campus").results
  var studentsCol = session.getDatabase("smart_campus").students
  var notificationsCol = session.getDatabase("smart_campus").notifications
  
  // Step 1: Publish results for a course
  var courseId = ObjectId("your_course_id_here")
  
  // Update all unpublished results for this course
  var updateResult = resultsCol.updateMany(
    {
      course: courseId,
      isPublished: false
    },
    {
      $set: {
        isPublished: true,
        publishedDate: new Date()
      }
    },
    { session: session }
  )
  
  print("Updated " + updateResult.modifiedCount + " results")
  
  // Step 2: Get all students for this course
  var results = resultsCol.find(
    { course: courseId },
    { session: session }
  ).toArray()
  
  // Step 3: Create notifications for each student
  var notifications = []
  
  for (var i = 0; i < results.length; i++) {
    var result = results[i]
    
    notifications.push({
      title: "Results Published",
      message: "Your results for " + result.courseName + " have been published",
      type: "Info",
      category: "Result",
      recipient: {
        userId: result.student,
        userType: "Student"
      },
      sender: {
        userType: "System"
      },
      priority: "High",
      isRead: false,
      createdAt: new Date()
    })
    
    // Step 4: Update student CGPA (simplified)
    studentsCol.updateOne(
      { _id: result.student },
      {
        $set: {
          cgpa: result.percentage / 10  // Simplified calculation
        }
      },
      { session: session }
    )
  }
  
  // Insert all notifications
  if (notifications.length > 0) {
    notificationsCol.insertMany(notifications, { session: session })
  }
  
  // Commit transaction
  session.commitTransaction()
  print("✅ Results published successfully for " + results.length + " students")
  
} catch (error) {
  session.abortTransaction()
  print("❌ Transaction failed: " + error.message)
  
} finally {
  session.endSession()
}

// ========================================
// TRANSACTION EXAMPLE 3: Assignment Submission
// ========================================

var session = db.getMongo().startSession()

try {
  session.startTransaction()
  
  var assignmentsCol = session.getDatabase("smart_campus").assignments
  var studentsCol = session.getDatabase("smart_campus").students
  var activityCol = session.getDatabase("smart_campus").activity_logs
  
  var assignmentId = ObjectId("your_assignment_id")
  var studentId = ObjectId("your_student_id")
  
  // Step 1: Find assignment
  var assignment = assignmentsCol.findOne(
    { _id: assignmentId },
    { session: session }
  )
  
  if (!assignment) {
    throw new Error("Assignment not found")
  }
  
  // Step 2: Check if already submitted
  var alreadySubmitted = assignment.submissions.some(function(sub) {
    return sub.student.equals(studentId)
  })
  
  if (alreadySubmitted) {
    throw new Error("Assignment already submitted")
  }
  
  // Step 3: Find student
  var student = studentsCol.findOne(
    { _id: studentId },
    { session: session }
  )
  
  if (!student) {
    throw new Error("Student not found")
  }
  
  // Step 4: Check if overdue
  var isLate = new Date() > assignment.dueDate
  
  // Step 5: Add submission to assignment
  var submission = {
    student: student._id,
    studentName: student.name,
    studentRollNo: student.studentId,
    submittedDate: new Date(),
    status: isLate ? "Late" : "Submitted",
    isLate: isLate
  }
  
  assignmentsCol.updateOne(
    { _id: assignmentId },
    {
      $push: { submissions: submission },
      $inc: { totalSubmissions: 1 }
    },
    { session: session }
  )
  
  // Step 6: Log activity
  activityCol.insertOne(
    {
      user: {
        userId: student._id,
        userType: "Student",
        name: student.name,
        email: student.email
      },
      action: "Submit",
      entity: "Assignment",
      entityId: assignment._id,
      description: student.name + " submitted " + assignment.title + (isLate ? " (Late)" : ""),
      status: "Success",
      timestamp: new Date()
    },
    { session: session }
  )
  
  // Commit transaction
  session.commitTransaction()
  print("✅ Assignment submitted successfully" + (isLate ? " (Late submission)" : ""))
  
} catch (error) {
  session.abortTransaction()
  print("❌ Submission failed: " + error.message)
  
} finally {
  session.endSession()
}

// ========================================
// TRANSACTION EXAMPLE 4: Event Registration
// ========================================

var session = db.getMongo().startSession()

try {
  session.startTransaction()
  
  var eventsCol = session.getDatabase("smart_campus").events
  var studentsCol = session.getDatabase("smart_campus").students
  var notificationsCol = session.getDatabase("smart_campus").notifications
  
  var eventId = ObjectId("your_event_id")
  var studentId = ObjectId("your_student_id")
  
  // Step 1: Find event
  var event = eventsCol.findOne(
    { _id: eventId },
    { session: session }
  )
  
  if (!event) {
    throw new Error("Event not found")
  }
  
  // Step 2: Check if registration is open
  if (!event.isRegistrationOpen) {
    throw new Error("Registration is closed")
  }
  
  // Step 3: Check if event is full
  if (event.participants.length >= event.maxParticipants) {
    throw new Error("Event is full")
  }
  
  // Step 4: Check if already registered
  var alreadyRegistered = event.participants.some(function(p) {
    return p.userId.equals(studentId)
  })
  
  if (alreadyRegistered) {
    throw new Error("Already registered for this event")
  }
  
  // Step 5: Find student
  var student = studentsCol.findOne(
    { _id: studentId },
    { session: session }
  )
  
  if (!student) {
    throw new Error("Student not found")
  }
  
  // Step 6: Add participant to event
  eventsCol.updateOne(
    { _id: eventId },
    {
      $push: {
        participants: {
          userId: student._id,
          userType: "Student",
          name: student.name,
          registrationDate: new Date(),
          attended: false
        }
      }
    },
    { session: session }
  )
  
  // Step 7: Create notification
  notificationsCol.insertOne(
    {
      title: "Event Registration Successful",
      message: "You have successfully registered for " + event.title,
      type: "Success",
      category: "Event",
      recipient: {
        userId: student._id,
        userType: "Student"
      },
      priority: "Medium",
      isRead: false,
      createdAt: new Date()
    },
    { session: session }
  )
  
  // Commit transaction
  session.commitTransaction()
  print("✅ Registered successfully for event: " + event.title)
  
} catch (error) {
  session.abortTransaction()
  print("❌ Registration failed: " + error.message)
  
} finally {
  session.endSession()
}

// ========================================
// TRANSACTION WITH RETRY LOGIC
// ========================================

function enrollStudentWithRetry(studentId, courseId) {
  var maxRetries = 3
  var retryCount = 0
  
  while (retryCount < maxRetries) {
    var session = db.getMongo().startSession()
    
    try {
      session.startTransaction({
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
        readPreference: "primary"
      })
      
      // ... perform transaction operations ...
      
      session.commitTransaction()
      print("✅ Transaction succeeded")
      return true
      
    } catch (error) {
      session.abortTransaction()
      
      if (error.hasOwnProperty("errorLabels") && 
          error.errorLabels.includes("TransientTransactionError")) {
        print("⚠️  Transient error, retrying... (attempt " + (retryCount + 1) + ")")
        retryCount++
        continue
      } else {
        print("❌ Transaction failed: " + error.message)
        return false
      }
      
    } finally {
      session.endSession()
    }
  }
  
  print("❌ Transaction failed after " + maxRetries + " retries")
  return false
}

// ========================================
// TRANSACTION NOTES
// ========================================

/*
ACID PROPERTIES:
- Atomicity: All operations succeed or all fail
- Consistency: Database remains in valid state
- Isolation: Concurrent transactions don't interfere
- Durability: Committed changes are permanent

TRANSACTION REQUIREMENTS:
- MongoDB 4.0+ for replica sets
- MongoDB 4.2+ for sharded clusters
- WiredTiger storage engine

TRANSACTION OPTIONS:
- readConcern: "snapshot", "local", "majority"
- writeConcern: { w: "majority", j: true }
- maxCommitTimeMS: Maximum time for commit

BEST PRACTICES:
1. Keep transactions short
2. Don't mix DDL and DML operations
3. Handle TransientTransactionError with retry
4. Use appropriate read/write concerns
5. Set reasonable timeouts
6. Avoid long-running operations in transactions

LIMITATIONS:
- Maximum transaction lifetime: 60 seconds (default)
- No DDL operations (createCollection, createIndex, etc.)
- Maximum 16MB document size
- Operations on more than 1000 documents may fail

WHEN TO USE TRANSACTIONS:
✓ Multi-document operations that must be atomic
✓ Financial operations
✓ Inventory management
✓ Critical data consistency requirements

WHEN NOT TO USE TRANSACTIONS:
✗ Single document operations (already atomic)
✗ Operations that can use embedded documents
✗ High-throughput scenarios
✗ Long-running operations
*/

// ========================================
// CHECK TRANSACTION SUPPORT
// ========================================

// Check if replica set is configured
db.adminCommand({ replSetGetStatus: 1 })

// Check server version
db.version()

// Check if transactions are supported
try {
  var session = db.getMongo().startSession()
  session.startTransaction()
  session.commitTransaction()
  session.endSession()
  print("✅ Transactions are supported")
} catch (error) {
  print("❌ Transactions not supported: " + error.message)
  print("💡 Hint: Run MongoDB as replica set")
}
