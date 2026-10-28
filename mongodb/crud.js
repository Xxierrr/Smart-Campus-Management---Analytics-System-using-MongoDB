/**
 * MongoDB CRUD Operations Demonstration
 * 
 * This file demonstrates all CRUD (Create, Read, Update, Delete) operations
 * These commands can be run in MongoDB Shell (mongosh) or MongoDB Compass
 */

// ===========================
// DATABASE SELECTION
// ===========================

use smart_campus

// ===========================
// CREATE OPERATIONS
// ===========================

// 1. insertOne() - Insert a single document
db.students.insertOne({
  studentId: "CSE2024001",
  name: "Test Student",
  email: "test.student@campus.edu",
  department: "CSE",
  semester: 5,
  cgpa: 8.5,
  skills: ["Python", "MongoDB", "JavaScript"],
  contact: {
    phone: "9876543210",
    city: "Ghaziabad",
    state: "Uttar Pradesh"
  },
  isActive: true,
  admissionDate: new Date()
})

// 2. insertMany() - Insert multiple documents
db.faculty.insertMany([
  {
    facultyId: "FAC100",
    name: "Dr. Test Faculty 1",
    email: "faculty1@campus.edu",
    department: "CSE",
    designation: "Professor",
    experience: 10,
    isActive: true
  },
  {
    facultyId: "FAC101",
    name: "Dr. Test Faculty 2",
    email: "faculty2@campus.edu",
    department: "ECE",
    designation: "Associate Professor",
    experience: 8,
    isActive: true
  }
])

// ===========================
// READ OPERATIONS
// ===========================

// 3. find() - Find all documents
db.students.find()

// 4. find() with query - Find students from CSE department
db.students.find({ department: "CSE" })

// 5. find() with multiple conditions
db.students.find({
  department: "CSE",
  semester: 5,
  isActive: true
})

// 6. findOne() - Find single document
db.students.findOne({ studentId: "CSE2024001" })

// 7. find() with projection - Select specific fields only
db.students.find(
  { department: "CSE" },
  { 
    studentId: 1, 
    name: 1, 
    department: 1, 
    cgpa: 1,
    _id: 0  // Exclude _id field
  }
)

// 8. find() with sorting
db.students.find({ department: "CSE" }).sort({ cgpa: -1 })  // Descending order

// 9. find() with limit
db.students.find({ department: "CSE" }).limit(10)

// 10. find() with skip and limit (pagination)
db.students.find({ department: "CSE" })
  .skip(10)
  .limit(10)

// 11. find() with sorting, limiting, and projection
db.students.find(
  { isActive: true },
  { name: 1, studentId: 1, cgpa: 1 }
)
  .sort({ cgpa: -1 })
  .limit(5)

// 12. count documents
db.students.countDocuments({ department: "CSE" })

// ===========================
// UPDATE OPERATIONS
// ===========================

// 13. updateOne() - Update single document using $set
db.students.updateOne(
  { studentId: "CSE2024001" },
  {
    $set: {
      cgpa: 9.0,
      semester: 6
    }
  }
)

// 14. updateMany() - Update multiple documents
db.students.updateMany(
  { department: "CSE", semester: 5 },
  {
    $set: {
      semester: 6
    }
  }
)

// 15. $inc - Increment a numeric field
db.students.updateOne(
  { studentId: "CSE2024001" },
  {
    $inc: { semester: 1 }  // Increment semester by 1
  }
)

// 16. $push - Add element to array
db.students.updateOne(
  { studentId: "CSE2024001" },
  {
    $push: {
      skills: "React.js"
    }
  }
)

// 17. $pull - Remove element from array
db.students.updateOne(
  { studentId: "CSE2024001" },
  {
    $pull: {
      skills: "React.js"
    }
  }
)

// 18. $addToSet - Add to array only if not exists
db.students.updateOne(
  { studentId: "CSE2024001" },
  {
    $addToSet: {
      skills: "Node.js"
    }
  }
)

// 19. $unset - Remove a field
db.students.updateOne(
  { studentId: "CSE2024001" },
  {
    $unset: {
      temporaryField: ""
    }
  }
)

// 20. findOneAndUpdate() - Find and update, return updated document
db.students.findOneAndUpdate(
  { studentId: "CSE2024001" },
  {
    $set: { cgpa: 9.2 }
  },
  {
    returnDocument: "after"  // Return updated document
  }
)

// ===========================
// DELETE OPERATIONS
// ===========================

// 21. deleteOne() - Delete single document
db.students.deleteOne({ studentId: "CSE2024001" })

// 22. deleteMany() - Delete multiple documents
db.faculty.deleteMany({ 
  facultyId: { $in: ["FAC100", "FAC101"] }
})

// 23. Soft delete using update (recommended for production)
db.students.updateOne(
  { studentId: "CSE2024001" },
  {
    $set: {
      isActive: false,
      deletedAt: new Date()
    }
  }
)

// ===========================
// REPLACE OPERATION
// ===========================

// 24. replaceOne() - Replace entire document
db.students.replaceOne(
  { studentId: "CSE2024001" },
  {
    studentId: "CSE2024001",
    name: "Completely New Student",
    email: "new@campus.edu",
    department: "CSE",
    semester: 1,
    isActive: true
  }
)

// ===========================
// UPSERT OPERATION
// ===========================

// 25. upsert - Update if exists, insert if not
db.students.updateOne(
  { studentId: "CSE2024999" },
  {
    $set: {
      name: "Upsert Student",
      email: "upsert@campus.edu",
      department: "CSE",
      semester: 1
    }
  },
  {
    upsert: true  // Insert if document doesn't exist
  }
)

// ===========================
// BULK OPERATIONS
// ===========================

// 26. bulkWrite() - Multiple operations in one call
db.students.bulkWrite([
  {
    insertOne: {
      document: {
        studentId: "BULK001",
        name: "Bulk Insert",
        email: "bulk1@campus.edu",
        department: "CSE",
        semester: 1,
        isActive: true
      }
    }
  },
  {
    updateOne: {
      filter: { studentId: "BULK001" },
      update: { $set: { cgpa: 8.0 } }
    }
  },
  {
    deleteOne: {
      filter: { studentId: "BULK001" }
    }
  }
])

// ===========================
// NOTES
// ===========================

/*
1. All operations return a result object with information about the operation
2. Use try-catch in production code to handle errors
3. Always validate data before inserting/updating
4. Use soft deletes (isActive: false) instead of hard deletes for important data
5. Use bulkWrite() for better performance when doing multiple operations
6. Always create indexes on fields used in queries
*/
