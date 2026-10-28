/**
 * MongoDB Indexing Demonstration
 * 
 * Demonstrates:
 * - Index creation
 * - Index types
 * - Index management
 * - Performance impact
 * - Query optimization
 */

use smart_campus

// ========================================
// SINGLE FIELD INDEXES
// ========================================

// 1. Create single field index (ascending)
db.students.createIndex({ studentId: 1 })

// 2. Create single field index (descending)
db.students.createIndex({ cgpa: -1 })

// 3. Create index on nested field
db.students.createIndex({ "contact.city": 1 })

// ========================================
// COMPOUND INDEXES
// ========================================

// 4. Compound index (multiple fields)
db.students.createIndex({ 
  department: 1, 
  semester: 1 
})

// 5. Compound index with different sort orders
db.results.createIndex({ 
  student: 1, 
  semester: 1, 
  percentage: -1 
})

// 6. Compound index for common query pattern
db.students.createIndex({ 
  department: 1, 
  semester: 1, 
  cgpa: -1 
})

// ========================================
// UNIQUE INDEXES
// ========================================

// 7. Unique index (ensures uniqueness)
db.students.createIndex(
  { email: 1 },
  { unique: true }
)

// 8. Unique compound index
db.students.createIndex(
  { studentId: 1, department: 1 },
  { unique: true }
)

// ========================================
// TEXT INDEXES
// ========================================

// 9. Single field text index
db.events.createIndex({ 
  title: "text" 
})

// 10. Multiple field text index
db.events.createIndex({ 
  title: "text", 
  description: "text" 
})

// 11. Text index with weights
db.events.createIndex(
  {
    title: "text",
    description: "text",
    tags: "text"
  },
  {
    weights: {
      title: 10,       // Higher weight = more importance
      tags: 5,
      description: 1
    },
    name: "event_text_index"
  }
)

// 12. Text search using text index
db.events.find({ 
  $text: { $search: "hackathon tech" }
})

// 13. Text search with score
db.events.find(
  { $text: { $search: "hackathon" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })

// ========================================
// SPARSE INDEXES
// ========================================

// 14. Sparse index (only index documents with the field)
db.students.createIndex(
  { dateOfBirth: 1 },
  { sparse: true }
)

// 15. Unique sparse index (useful for optional unique fields)
db.students.createIndex(
  { alternateEmail: 1 },
  { unique: true, sparse: true }
)

// ========================================
// PARTIAL INDEXES
// ========================================

// 16. Partial index (index only matching documents)
db.students.createIndex(
  { cgpa: -1 },
  {
    partialFilterExpression: {
      cgpa: { $gte: 8.0 },
      isActive: true
    }
  }
)

// 17. Partial index for specific department
db.students.createIndex(
  { semester: 1, cgpa: -1 },
  {
    partialFilterExpression: {
      department: "CSE"
    }
  }
)

// ========================================
// TTL INDEXES (Time-To-Live)
// ========================================

// 18. TTL index (auto-delete documents after specified time)
db.activity_logs.createIndex(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 }  // 90 days
)

// 19. TTL index for temporary data
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }  // 1 hour
)

// ========================================
// MULTIKEY INDEXES (Arrays)
// ========================================

// 20. Index on array field (automatically multikey)
db.students.createIndex({ skills: 1 })

// Query using multikey index
db.students.find({ skills: "Python" })

// 21. Compound index with array field
db.students.createIndex({ 
  department: 1, 
  skills: 1 
})

// ========================================
// GEOSPATIAL INDEXES
// ========================================

// 22. 2dsphere index for geospatial queries
db.campus_locations.createIndex({ 
  location: "2dsphere" 
})

// Example geospatial query (requires GeoJSON data)
// db.campus_locations.find({
//   location: {
//     $near: {
//       $geometry: {
//         type: "Point",
//         coordinates: [77.5, 28.5]
//       },
//       $maxDistance: 5000  // 5km
//     }
//   }
// })

// ========================================
// INDEX MANAGEMENT
// ========================================

// 23. List all indexes on a collection
db.students.getIndexes()

// 24. Get index statistics
db.students.stats().indexSizes

// 25. Drop an index
db.students.dropIndex("email_1")

// 26. Drop index by specification
db.students.dropIndex({ cgpa: -1 })

// 27. Drop all indexes except _id
db.students.dropIndexes()

// 28. Get index names only
db.students.getIndexes().map(idx => idx.name)

// ========================================
// INDEX PERFORMANCE ANALYSIS
// ========================================

// 29. Explain query plan (WITHOUT index)
db.students.find({ 
  department: "CSE", 
  cgpa: { $gte: 8.0 } 
}).explain("executionStats")

// Create index
db.students.createIndex({ department: 1, cgpa: -1 })

// 30. Explain query plan (WITH index)
db.students.find({ 
  department: "CSE", 
  cgpa: { $gte: 8.0 } 
}).explain("executionStats")

// 31. Compare execution time
// Without index:
var startTime = new Date()
db.students.find({ 
  department: "CSE", 
  cgpa: { $gte: 8.0 } 
}).toArray()
var endTime = new Date()
print("Time without index: " + (endTime - startTime) + "ms")

// With index:
startTime = new Date()
db.students.find({ 
  department: "CSE", 
  cgpa: { $gte: 8.0 } 
}).toArray()
endTime = new Date()
print("Time with index: " + (endTime - startTime) + "ms")

// ========================================
// INDEX HINTS
// ========================================

// 32. Force query to use specific index
db.students.find({ 
  department: "CSE", 
  semester: 5 
}).hint({ department: 1, semester: 1 })

// 33. Force query to NOT use index (for testing)
db.students.find({ 
  department: "CSE" 
}).hint({ $natural: 1 })

// ========================================
// COVERED QUERIES
// ========================================

// 34. Create index for covered query
db.students.createIndex({ 
  department: 1, 
  semester: 1, 
  cgpa: 1, 
  name: 1 
})

// 35. Covered query (all fields in index, no document scan needed)
db.students.find(
  { department: "CSE", semester: 5 },
  { _id: 0, name: 1, cgpa: 1 }  // Only return indexed fields
).hint({ department: 1, semester: 1, cgpa: 1, name: 1 })

// Verify it's covered (totalDocsExamined should be 0)
db.students.find(
  { department: "CSE", semester: 5 },
  { _id: 0, name: 1, cgpa: 1 }
).hint({ department: 1, semester: 1, cgpa: 1, name: 1 })
  .explain("executionStats")

// ========================================
// INDEX PREFIXES
// ========================================

// 36. Compound index
db.students.createIndex({ 
  department: 1, 
  semester: 1, 
  cgpa: -1 
})

// These queries can use the index:
// ✓ department
db.students.find({ department: "CSE" })

// ✓ department + semester
db.students.find({ department: "CSE", semester: 5 })

// ✓ department + semester + cgpa
db.students.find({ department: "CSE", semester: 5, cgpa: { $gte: 8.0 } })

// These queries CANNOT use the index efficiently:
// ✗ semester only
db.students.find({ semester: 5 })

// ✗ cgpa only
db.students.find({ cgpa: { $gte: 8.0 } })

// ========================================
// INDEX SIZE AND STATISTICS
// ========================================

// 37. Collection statistics with index info
db.students.stats()

// 38. Detailed index statistics
db.students.aggregate([
  { $indexStats: {} }
])

// 39. Index size in bytes
db.students.stats().indexSizes

// 40. Total index size
db.students.totalIndexSize()

// ========================================
// INDEX BUILDING OPTIONS
// ========================================

// 41. Build index in background (old method)
db.students.createIndex(
  { name: 1 },
  { background: true }
)

// 42. Create index with name
db.students.createIndex(
  { email: 1 },
  { name: "email_unique_idx", unique: true }
)

// 43. Create case-insensitive index
db.students.createIndex(
  { email: 1 },
  { collation: { locale: "en", strength: 2 } }
)

// Query using same collation
db.students.find({ email: "test@example.com" })
  .collation({ locale: "en", strength: 2 })

// ========================================
// WILDCARD INDEXES
// ========================================

// 44. Wildcard index (index all fields)
db.students.createIndex({ "$**": 1 })

// 45. Wildcard index on specific path
db.students.createIndex({ "contact.$**": 1 })

// ========================================
// PRACTICAL EXAMPLES
// ========================================

// 46. Indexes for Smart Campus System

// Students collection indexes
db.students.createIndex({ studentId: 1 }, { unique: true })
db.students.createIndex({ email: 1 }, { unique: true })
db.students.createIndex({ department: 1, semester: 1 })
db.students.createIndex({ cgpa: -1 })
db.students.createIndex({ name: "text", "contact.city": "text" })
db.students.createIndex({ isActive: 1, department: 1 })

// Results collection indexes
db.results.createIndex({ student: 1, course: 1, examinationType: 1 })
db.results.createIndex({ department: 1, semester: 1 })
db.results.createIndex({ percentage: -1 })
db.results.createIndex({ grade: 1 })
db.results.createIndex({ academicYear: 1 })

// Attendance collection indexes
db.attendance.createIndex({ course: 1, date: 1 })
db.attendance.createIndex({ date: -1 })
db.attendance.createIndex({ department: 1, semester: 1 })
db.attendance.createIndex({ "students.studentId": 1 })

// Events collection indexes
db.events.createIndex({ eventDate: 1 })
db.events.createIndex({ category: 1 })
db.events.createIndex({ status: 1 })
db.events.createIndex({ title: "text", description: "text", tags: "text" })

// Activity logs collection indexes
db.activity_logs.createIndex({ "user.userId": 1, timestamp: -1 })
db.activity_logs.createIndex({ action: 1, timestamp: -1 })
db.activity_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 })

// ========================================
// INDEX BEST PRACTICES
// ========================================

/*
1. CREATE INDEXES FOR:
   - Fields used in queries frequently
   - Fields used in sort operations
   - Fields used in join operations ($lookup)
   - Unique fields (email, studentId, etc.)

2. INDEX CONSIDERATIONS:
   - Indexes speed up reads but slow down writes
   - Each index requires storage space
   - Too many indexes can hurt performance
   - Index in the order of: equality > sort > range

3. COMPOUND INDEX RULES:
   - Order matters: put equality fields first
   - Use ESR rule: Equality, Sort, Range
   - Index prefixes can be used independently

4. AVOID:
   - Indexing fields that are rarely queried
   - Indexing fields with low cardinality (few unique values)
   - Creating redundant indexes
   - Too many indexes on write-heavy collections

5. MONITOR:
   - Use explain() to analyze queries
   - Monitor index usage with $indexStats
   - Remove unused indexes
   - Rebuild fragmented indexes

6. SPECIAL CASES:
   - Use text indexes for full-text search
   - Use TTL indexes for auto-expiring data
   - Use sparse indexes for optional fields
   - Use partial indexes to reduce index size
*/

// ========================================
// VERIFY INDEXES CREATED
// ========================================

// List all indexes
db.students.getIndexes()
db.results.getIndexes()
db.attendance.getIndexes()
db.events.getIndexes()
db.activity_logs.getIndexes()
