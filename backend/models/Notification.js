const mongoose = require('mongoose');

/**
 * Notification Model
 * 
 * Demonstrates:
 * - Notification system
 * - Dynamic references (polymorphic)
 * - Boolean flags
 */

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  type: {
    type: String,
    enum: ['Info', 'Success', 'Warning', 'Error', 'Announcement'],
    default: 'Info'
  },
  
  category: {
    type: String,
    enum: ['Academic', 'Administrative', 'Event', 'Assignment', 'Result', 'Attendance', 'General'],
    required: true
  },
  
  // Dynamic reference - can be Student or Faculty
  recipient: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recipient.userType',
      required: true
    },
    userType: {
      type: String,
      enum: ['Student', 'Faculty'],
      required: true
    }
  },
  
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'sender.userType'
    },
    userType: {
      type: String,
      enum: ['Student', 'Faculty', 'System']
    },
    name: String
  },
  
  isRead: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date
  },
  
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  
  link: {
    type: String // URL to related content
  },
  
  expiresAt: {
    type: Date
  },
  
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
  
}, {
  timestamps: true,
  collection: 'notifications'
});

// Indexes
notificationSchema.index({ 'recipient.userId': 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ category: 1 });
notificationSchema.index({ expiresAt: 1 });

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
