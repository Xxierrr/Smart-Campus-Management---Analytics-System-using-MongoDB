const mongoose = require('mongoose');

/**
 * Event Model
 * 
 * Demonstrates:
 * - Campus event management
 * - Text search capabilities
 * - Array handling for participants
 * - Date handling
 */

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  
  category: {
    type: String,
    required: true,
    enum: [
      'Technical',
      'Cultural',
      'Sports',
      'Workshop',
      'Seminar',
      'Conference',
      'Webinar',
      'Competition',
      'Social',
      'Academic',
      'Other'
    ]
  },
  
  eventDate: {
    type: Date,
    required: true
  },
  
  startTime: {
    type: String,
    required: true
  },
  
  endTime: {
    type: String,
    required: true
  },
  
  venue: {
    type: String,
    required: true
  },
  
  department: {
    type: String,
    enum: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EE', 'BBA', 'MBA', 'All']
  },
  
  organizer: {
    name: {
      type: String,
      required: true
    },
    contact: String,
    email: String
  },
  
  // Array of participant references
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'participants.userType'
    },
    userType: {
      type: String,
      enum: ['Student', 'Faculty']
    },
    name: String,
    registrationDate: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    }
  }],
  
  maxParticipants: {
    type: Number,
    default: 100
  },
  
  registrationDeadline: {
    type: Date
  },
  
  isRegistrationOpen: {
    type: Boolean,
    default: true
  },
  
  bannerUrl: String,
  
  tags: [{
    type: String,
    trim: true
  }],
  
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },
  
  prizes: [{
    position: String,
    description: String,
    amount: Number
  }],
  
  sponsors: [{
    name: String,
    logoUrl: String,
    website: String
  }],
  
  isActive: {
    type: Boolean,
    default: true
  }
  
}, {
  timestamps: true,
  collection: 'events'
});

// Indexes
eventSchema.index({ eventDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ department: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' }); // Text index for search

// Virtual for participant count
eventSchema.virtual('participantCount').get(function() {
  return this.participants ? this.participants.length : 0;
});

// Check if event is full
eventSchema.methods.isFull = function() {
  return this.participants.length >= this.maxParticipants;
};

// Check if registration is open
eventSchema.methods.canRegister = function() {
  if (!this.isRegistrationOpen) return false;
  if (this.isFull()) return false;
  if (this.registrationDeadline && new Date() > this.registrationDeadline) return false;
  return true;
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
