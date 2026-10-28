const mongoose = require('mongoose');

/**
 * Activity Log Model
 * 
 * Demonstrates:
 * - User activity tracking
 * - Logging system
 * - Time-series data
 * - Mixed type for flexible metadata
 */

const activityLogSchema = new mongoose.Schema({
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'user.userType',
      required: true
    },
    userType: {
      type: String,
      enum: ['Student', 'Faculty', 'Admin'],
      required: true
    },
    name: String,
    email: String
  },
  
  action: {
    type: String,
    required: true,
    enum: [
      'Login',
      'Logout',
      'Create',
      'Update',
      'Delete',
      'View',
      'Submit',
      'Register',
      'Enroll',
      'Download',
      'Upload',
      'Search',
      'Export'
    ]
  },
  
  entity: {
    type: String,
    required: true,
    enum: [
      'Student',
      'Faculty',
      'Course',
      'Assignment',
      'Attendance',
      'Result',
      'Event',
      'Notification',
      'Profile',
      'System'
    ]
  },
  
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  
  description: {
    type: String,
    required: true
  },
  
  ipAddress: String,
  
  userAgent: String,
  
  // Mixed type for flexible metadata storage
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  status: {
    type: String,
    enum: ['Success', 'Failure', 'Pending'],
    default: 'Success'
  },
  
  errorMessage: String,
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
  
}, {
  timestamps: true,
  collection: 'activity_logs'
});

// Indexes for efficient querying
activityLogSchema.index({ 'user.userId': 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ entity: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ status: 1 });

// TTL index - auto-delete logs older than 90 days (optional)
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Static method to log activity
activityLogSchema.statics.logActivity = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
