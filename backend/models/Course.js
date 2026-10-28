const mongoose = require('mongoose');

/**
 * Course Model
 * 
 * Demonstrates:
 * - Course structure
 * - Referencing (faculty)
 * - Arrays (topics, enrolledStudents)
 * - Embedded documents
 */

const courseSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EE', 'BBA', 'MBA']
  },
  
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  
  // Referencing faculty
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  
  facultyName: String, // Denormalized for quick access
  
  // Array of topics covered
  topics: [{
    name: {
      type: String,
      required: true
    },
    hours: Number,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  
  // Course schedule
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    startTime: String,
    endTime: String,
    room: String
  }],
  
  // Array of enrolled student references
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  
  maxCapacity: {
    type: Number,
    default: 60
  },
  
  courseType: {
    type: String,
    enum: ['Theory', 'Lab', 'Theory + Lab', 'Project'],
    default: 'Theory'
  },
  
  description: {
    type: String,
    maxlength: 1000
  },
  
  prerequisites: [{
    type: String
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  academicYear: {
    type: String,
    required: true
  }
  
}, {
  timestamps: true,
  collection: 'courses'
});

// Indexes
courseSchema.index({ courseId: 1 });
courseSchema.index({ courseCode: 1 }, { unique: true });
courseSchema.index({ department: 1, semester: 1 });
courseSchema.index({ faculty: 1 });
courseSchema.index({ courseName: 'text', description: 'text' });

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents ? this.enrolledStudents.length : 0;
});

// Check if course is full
courseSchema.methods.isFull = function() {
  return this.enrolledStudents.length >= this.maxCapacity;
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
