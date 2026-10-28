/**
 * MongoDB Database Administration Commands
 * 
 * Demonstrates:
 * - Database management
 * - Collection management
 * - User management and security
 * - Backup and restore
 * - Monitoring and performance
 * - Profiling
 * - Replication basics
 * - Sharding basics
 */

// ========================================
// DATABASE OPERATIONS
// ========================================

// Show all databases
show dbs

// Switch to database (creates if doesn't exist)
use smart_campus

// Show current database
db

// Get database name
db.getName()

// Database statistics
db.stats()

// Drop database (⚠️  DANGEROUS)
// db.dropDatabase()

// ========================================
// COLLECTION OPERATIONS
// ========================================

// Show all collections
show collections

// Create collection explicitly
db.createCollection("test_collection")

// Create collection with options
db.createCollection("capped_collection", {
  capped: true,
  size: 100000,  // Size in bytes
  max: 1000      // Maximum documents
})

// Create collection with validation
db.createCollection("validated_students", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "department"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        email: {
          bsonType: "string",
          pattern: "^.+@.+$",
          description: "must be a valid email"
        },
        cgpa: {
          bsonType: "double",
          minimum: 0,
          maximum: 10
        }
      }
    }
  }
})

// Collection statistics
db.students.stats()

// Get collection size
db.students.dataSize()

// Get collection count
db.students.count()

// Rename collection
// db.old_collection.renameCollection("new_collection")

// Drop collection
// db.test_collection.drop()

// ========================================
// USER MANAGEMENT AND SECURITY
// ========================================

// Switch to admin database
use admin

// Create admin user (do this first on new installation)
db.createUser({
  user: "admin",
  pwd: "securePassword123",  // Change this!
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" },
    { role: "dbAdminAnyDatabase", db: "admin" }
  ]
})

// Switch to smart_campus database
use smart_campus

// Create database-specific user
db.createUser({
  user: "campus_app",
  pwd: "app_password123",  // Change this!
  roles: [
    { role: "readWrite", db: "smart_campus" }
  ]
})

// Create read-only user
db.createUser({
  user: "campus_reader",
  pwd: "reader_password123",
  roles: [
    { role: "read", db: "smart_campus" }
  ]
})

// List all users
db.getUsers()

// Show current user
db.runCommand({ connectionStatus: 1 })

// Update user password
db.changeUserPassword("campus_app", "new_password123")

// Grant role to user
db.grantRolesToUser("campus_app", [
  { role: "dbAdmin", db: "smart_campus" }
])

// Revoke role from user
db.revokeRolesFromUser("campus_app", [
  { role: "dbAdmin", db: "smart_campus" }
])

// Drop user
// db.dropUser("username")

// ========================================
// MONITORING AND STATISTICS
// ========================================

// Server status
db.serverStatus()

// Current operations
db.currentOp()

// Kill operation by opid
// db.killOp(opid)

// Get database profiling status
db.getProfilingStatus()

// Get profiling level
db.getProfilingLevel()

// Database statistics
db.stats()

// Collection statistics
db.students.stats()

// Index statistics
db.students.stats().indexSizes

// Storage statistics
db.students.storageSize()

// Total index size
db.students.totalIndexSize()

// Replica set status (if replica set is configured)
// rs.status()

// Get server build info
db.serverBuildInfo()

// Get MongoDB version
db.version()

// Get host info
db.hostInfo()

// ========================================
// QUERY PROFILING
// ========================================

// Set profiling level
// 0 = Off
// 1 = Log slow operations (> 100ms by default)
// 2 = Log all operations
db.setProfilingLevel(1, { slowms: 100 })

// Set profiling level to log all operations
db.setProfilingLevel(2)

// Turn off profiling
db.setProfilingLevel(0)

// View profiling data
db.system.profile.find().limit(10).sort({ ts: -1 }).pretty()

// View slow queries only
db.system.profile.find({
  millis: { $gt: 100 }
}).sort({ ts: -1 }).limit(10)

// Get profiling statistics
db.system.profile.find({}, { op: 1, ns: 1, millis: 1 }).sort({ millis: -1 }).limit(10)

// Clear profiling data
db.system.profile.drop()

// ========================================
// QUERY PERFORMANCE ANALYSIS
// ========================================

// Explain query
db.students.find({ department: "CSE" }).explain()

// Explain with execution stats
db.students.find({ department: "CSE" }).explain("executionStats")

// Explain with all verbosity
db.students.find({ department: "CSE" }).explain("allPlansExecution")

// Analyze aggregation pipeline
db.students.aggregate([
  { $match: { department: "CSE" } },
  { $group: { _id: "$semester", count: { $sum: 1 } } }
]).explain("executionStats")

// ========================================
// BACKUP AND RESTORE
// ========================================

/*
These commands are run in the terminal, not in mongosh:

BACKUP (mongodump):
------------------
# Backup entire database
mongodump --db smart_campus --out /path/to/backup

# Backup specific collection
mongodump --db smart_campus --collection students --out /path/to/backup

# Backup with compression
mongodump --db smart_campus --gzip --out /path/to/backup

# Backup from MongoDB Atlas
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/smart_campus" --out /path/to/backup


RESTORE (mongorestore):
----------------------
# Restore entire database
mongorestore --db smart_campus /path/to/backup/smart_campus

# Restore specific collection
mongorestore --db smart_campus --collection students /path/to/backup/smart_campus/students.bson

# Restore with drop (replace existing data)
mongorestore --db smart_campus --drop /path/to/backup/smart_campus

# Restore from gzip backup
mongorestore --gzip --db smart_campus /path/to/backup/smart_campus

# Restore to MongoDB Atlas
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/smart_campus" /path/to/backup/smart_campus


EXPORT (mongoexport - JSON/CSV):
--------------------------------
# Export collection to JSON
mongoexport --db smart_campus --collection students --out students.json

# Export to CSV
mongoexport --db smart_campus --collection students --type=csv --fields name,email,department --out students.csv

# Export with query
mongoexport --db smart_campus --collection students --query '{"department":"CSE"}' --out cse_students.json


IMPORT (mongoimport - JSON/CSV):
--------------------------------
# Import from JSON
mongoimport --db smart_campus --collection students --file students.json

# Import from CSV
mongoimport --db smart_campus --collection students --type=csv --headerline --file students.csv

# Import with drop
mongoimport --db smart_campus --collection students --drop --file students.json
*/

// ========================================
// REPLICATION (Replica Sets)
// ========================================

/*
REPLICA SET COMMANDS:
--------------------

# Initialize replica set (run once)
rs.initiate()

# Add member to replica set
rs.add("hostname:port")

# Remove member from replica set
rs.remove("hostname:port")

# Get replica set status
rs.status()

# Get replica set configuration
rs.conf()

# Check if node is primary
db.isMaster()

# Step down primary (force election)
rs.stepDown()

# Get replication info
db.printReplicationInfo()

# Get secondary replication lag
db.printSecondaryReplicationInfo()
*/

// Example: Initialize replica set
/*
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})
*/

// ========================================
// SHARDING
// ========================================

/*
SHARDING SETUP:
--------------

1. Start config servers (3 recommended):
   mongod --configsvr --replSet configReplSet --port 27019 --dbpath /data/configdb

2. Start shard servers (multiple mongod instances):
   mongod --shardsvr --replSet shard1 --port 27018 --dbpath /data/shard1

3. Start mongos (query router):
   mongos --configdb configReplSet/host1:27019,host2:27019 --port 27017

4. Connect to mongos and add shards:
*/

// Enable sharding on database
sh.enableSharding("smart_campus")

// Shard a collection
sh.shardCollection("smart_campus.students", { department: 1 })

// Shard with compound key
sh.shardCollection("smart_campus.results", { department: 1, semester: 1 })

// Shard with hashed key
sh.shardCollection("smart_campus.activity_logs", { _id: "hashed" })

// Check sharding status
sh.status()

// Add shard
sh.addShard("shard1/host:port")

// Remove shard
// sh.removeShard("shard1")

// Get collection sharding status
db.students.getShardDistribution()

// ========================================
// MAINTENANCE OPERATIONS
// ========================================

// Compact collection (reclaim disk space)
db.runCommand({ compact: "students" })

// Validate collection
db.students.validate()

// Validate with full check
db.students.validate({ full: true })

// Repair database (⚠️  Requires downtime)
// db.repairDatabase()

// Get database locks
db.currentOp({ $or: [{ waitingForLock: true }, { lockStats: { $exists: true } }] })

// Force checkpoint (WiredTiger)
db.adminCommand({ fsync: 1 })

// ========================================
// SERVER CONFIGURATION
// ========================================

// Get server parameters
db.adminCommand({ getParameter: "*" })

// Set server parameter
db.adminCommand({ setParameter: 1, logLevel: 1 })

// Get build info
db.adminCommand({ buildInfo: 1 })

// Get server log
db.adminCommand({ getLog: "global" })

// ========================================
// CONNECTION MANAGEMENT
// ========================================

// List active connections
db.serverStatus().connections

// Get current connection info
db.runCommand({ connectionStatus: 1 })

// Get network connections
db.serverStatus().network

// Kill all operations from a client
// db.currentOp().inprog.forEach(function(op) {
//   if (op.client === "192.168.1.100:12345") {
//     db.killOp(op.opid)
//   }
// })

// ========================================
// DIAGNOSTIC COMMANDS
// ========================================

// Database diagnostics
db.runCommand({ dbStats: 1 })

// Collection diagnostics
db.runCommand({ collStats: "students" })

// Top command (most used collections)
db.adminCommand({ top: 1 })

// Get locks
db.serverStatus().locks

// Get oplog size
db.printReplicationInfo()

// ========================================
// BEST PRACTICES FOR ADMINISTRATION
// ========================================

/*
SECURITY:
1. Enable authentication
2. Use strong passwords
3. Create users with minimal required privileges
4. Use network encryption (TLS/SSL)
5. Keep MongoDB updated
6. Firewall configuration
7. Audit logging

BACKUP:
1. Regular automated backups
2. Test restore procedures
3. Store backups off-site
4. Use incremental backups for large databases
5. Monitor backup success/failure

MONITORING:
1. Monitor disk space
2. Monitor connection count
3. Monitor operation times
4. Set up alerts for issues
5. Regular log reviews
6. Use MongoDB monitoring tools (MongoDB Atlas, Ops Manager)

PERFORMANCE:
1. Create appropriate indexes
2. Use profiling to find slow queries
3. Regular index maintenance
4. Monitor cache hit ratio
5. Optimize queries with explain()
6. Use aggregation pipelines efficiently

MAINTENANCE:
1. Regular compact operations
2. Index rebuilds when needed
3. Regular database validation
4. Keep oplog size appropriate
5. Monitor replica lag
6. Plan for upgrades
*/

// ========================================
// NOTES FOR ADBMS PROJECT
// ========================================

/*
For your ADBMS project demonstration:

1. DATABASE SETUP:
   - Show database creation
   - Show collection creation
   - Show validation rules

2. SECURITY:
   - Create at least one user
   - Explain role-based access control
   - Demonstrate authentication

3. MONITORING:
   - Show db.stats()
   - Show collection stats
   - Show indexes

4. PROFILING:
   - Enable profiling
   - Run some queries
   - Show slow query analysis

5. BACKUP:
   - Demonstrate mongodump command
   - Explain backup strategy
   - Show restore procedure

6. REPLICATION (Conceptual):
   - Explain replica sets
   - Show architecture diagram
   - Explain benefits (high availability, read scaling)

7. SHARDING (Conceptual):
   - Explain sharding architecture
   - When to use sharding
   - Show shard key selection

8. PERFORMANCE:
   - Show explain() output
   - Compare indexed vs non-indexed queries
   - Show index impact
*/
