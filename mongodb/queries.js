/**
 * MongoDB Query Operators Demonstration
 * 
 * Demonstrates all important MongoDB query operators
 * Run these in MongoDB Shell (mongosh) or MongoDB Compass
 */

use smart_campus

// ========================================
// COMPARISON OPERATORS
// ========================================

// $eq - Equal to
db.students.find({ department: { $eq: "CSE" } })
// Shorthand (implicit $eq)
db.students.find({ department: "CSE" })

// $ne - Not equal to
db.students.find({ department: { $ne: "CSE" } })

// $gt - Greater than
db.students.find({ cgpa: { $gt: 8.0 } })

// $gte - Greater than or equal to
db.students.find({ cgpa: { $gte: 8.0 } })

// $lt - Less than
db.students.find({ semester: { $lt: 5 } })

// $lte - Less than or equal to
db.students.find({ semester: { $lte: 5 } })

// $in - Match any value in array
db.students.find({ 
  department: { $in: ["CSE", "ECE", "IT"] }
})

// $nin - Not in array
db.students.find({ 
  department: { $nin: ["ME", "CE"] }
})

// ========================================
// LOGICAL OPERATORS
// ========================================

// $and - All conditions must be true
db.students.find({
  $and: [
    { department: "CSE" },
    { semester: { $gte: 5 } },
    { cgpa: { $gte: 7.5 } }
  ]
})

// Implicit $and (same as above)
db.students.find({
  department: "CSE",
  semester: { $gte: 5 },
  cgpa: { $gte: 7.5 }
})

// $or - At least one condition must be true
db.students.find({
  $or: [
    { department: "CSE" },
    { department: "ECE" },
    { cgpa: { $gte: 9.0 } }
  ]
})

// $not - Inverts the condition
db.students.find({
  cgpa: { $not: { $gte: 7.0 } }
})

// $nor - None of the conditions should be true
db.students.find({
  $nor: [
    { department: "CSE" },
    { cgpa: { $lt: 6.0 } }
  ]
})

// Combining $and and $or
db.students.find({
  $and: [
    { isActive: true },
    {
      $or: [
        { department: "CSE" },
        { department: "ECE" }
      ]
    },
    { cgpa: { $gte: 7.5 } }
  ]
})

// ========================================
// ELEMENT OPERATORS
// ========================================

// $exists - Field exists in document
db.students.find({ cgpa: { $exists: true } })

// Field doesn't exist
db.students.find({ temporaryField: { $exists: false } })

// $type - Field is of specific BSON type
db.students.find({ cgpa: { $type: "double" } })

// Multiple types
db.students.find({ 
  semester: { $type: ["int", "double"] }
})

// ========================================
// ARRAY OPERATORS
// ========================================

// $all - Array contains all specified elements
db.students.find({
  skills: { $all: ["Python", "MongoDB"] }
})

// $elemMatch - Array element matches all conditions
db.students.find({
  attendance: {
    $elemMatch: {
      percentage: { $gte: 75 },
      totalClasses: { $gte: 30 }
    }
  }
})

// $size - Array has specific length
db.students.find({
  skills: { $size: 3 }
})

// Array contains specific value (implicit)
db.students.find({
  skills: "Python"
})

// ========================================
// EVALUATION OPERATORS
// ========================================

// $regex - Pattern matching
db.students.find({
  name: { $regex: /sharma/i }  // Case-insensitive
})

// $regex with options
db.students.find({
  email: { 
    $regex: "^rahul",
    $options: "i"  // case-insensitive
  }
})

// $expr - Use aggregation expressions in query
db.students.find({
  $expr: {
    $gt: ["$cgpa", 8.5]
  }
})

// $mod - Modulo operation
db.students.find({
  semester: { $mod: [2, 0] }  // Even semesters
})

// ========================================
// NESTED DOCUMENT QUERIES
// ========================================

// Query nested field using dot notation
db.students.find({
  "contact.city": "Ghaziabad"
})

// Query multiple nested fields
db.students.find({
  "contact.city": "Ghaziabad",
  "contact.state": "Uttar Pradesh"
})

// Query nested document exactly
db.students.find({
  contact: {
    phone: "9876543210",
    city: "Ghaziabad",
    state: "Uttar Pradesh"
  }
})

// ========================================
// PROJECTION
// ========================================

// Include specific fields
db.students.find(
  { department: "CSE" },
  { 
    name: 1, 
    studentId: 1, 
    cgpa: 1 
  }
)

// Exclude specific fields
db.students.find(
  { department: "CSE" },
  { 
    password: 0,
    __v: 0
  }
)

// Exclude _id and include others
db.students.find(
  { department: "CSE" },
  { 
    _id: 0,
    name: 1, 
    department: 1,
    cgpa: 1 
  }
)

// Project nested fields
db.students.find(
  {},
  { 
    name: 1,
    "contact.city": 1,
    "contact.phone": 1
  }
)

// $slice - Limit array elements returned
db.students.find(
  { department: "CSE" },
  { 
    name: 1,
    skills: { $slice: 3 }  // First 3 skills
  }
)

// $slice with skip
db.students.find(
  {},
  { 
    name: 1,
    skills: { $slice: [2, 3] }  // Skip 2, return 3
  }
)

// ========================================
// SORTING
// ========================================

// Sort ascending
db.students.find().sort({ cgpa: 1 })

// Sort descending
db.students.find().sort({ cgpa: -1 })

// Sort by multiple fields
db.students.find().sort({ 
  department: 1, 
  cgpa: -1 
})

// ========================================
// LIMITING AND SKIPPING
// ========================================

// Limit results
db.students.find().limit(10)

// Skip and limit (pagination)
db.students.find()
  .skip(20)
  .limit(10)

// Top 5 students by CGPA
db.students.find()
  .sort({ cgpa: -1 })
  .limit(5)

// ========================================
// COMPLEX QUERIES
// ========================================

// Students with CGPA > 8.0 in CSE or ECE
db.students.find({
  $and: [
    { cgpa: { $gt: 8.0 } },
    { department: { $in: ["CSE", "ECE"] } },
    { isActive: true }
  ]
}).sort({ cgpa: -1 })

// Students with low attendance
db.students.find({
  "attendance.percentage": { $lt: 75 }
})

// Students with specific skills
db.students.find({
  skills: { $all: ["Python", "JavaScript"] }
}).project({ name: 1, skills: 1 })

// Find students not in semester 1 or 2
db.students.find({
  semester: { $nin: [1, 2] }
})

// Find active CSE students with CGPA between 7 and 9
db.students.find({
  department: "CSE",
  isActive: true,
  cgpa: { $gte: 7.0, $lte: 9.0 }
})

// ========================================
// COUNTING AND DISTINCT
// ========================================

// Count documents
db.students.countDocuments({ department: "CSE" })

// Count all documents
db.students.countDocuments()

// Estimated count (faster, less accurate)
db.students.estimatedDocumentCount()

// Get distinct values
db.students.distinct("department")

// Distinct with query
db.students.distinct("department", { isActive: true })

// ========================================
// DATE QUERIES
// ========================================

// Find by specific date
db.students.find({
  admissionDate: new Date("2023-07-15")
})

// Date range
db.students.find({
  admissionDate: {
    $gte: new Date("2023-01-01"),
    $lte: new Date("2023-12-31")
  }
})

// Events in next 30 days
db.events.find({
  eventDate: {
    $gte: new Date(),
    $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
})

// ========================================
// NULL AND MISSING FIELD QUERIES
// ========================================

// Field is null
db.students.find({ dateOfBirth: null })

// Field is null or doesn't exist
db.students.find({ 
  dateOfBirth: { $in: [null] }
})

// Field exists and is not null
db.students.find({
  dateOfBirth: { $exists: true, $ne: null }
})

// ========================================
// NOTES
// ========================================

/*
Query Operator Categories:
1. Comparison: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin
2. Logical: $and, $or, $not, $nor
3. Element: $exists, $type
4. Array: $all, $elemMatch, $size
5. Evaluation: $regex, $expr, $mod

Best Practices:
- Use indexes on fields used in queries
- Use projection to return only needed fields
- Use explain() to analyze query performance
- Avoid $regex on non-indexed fields for large collections
- Use $in instead of multiple $or conditions when possible
*/
