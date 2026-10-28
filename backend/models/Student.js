const mongoose = require('mongoose');

/**
 * Student Model
 * 
 * Demonstrates:
 * - Document structure with various BSON types
 * - Embedded documents (contact, attendance)
 * - Arrays (skills, enrolledCourses)
 * - Nested objects
 * - Schema validation
 * - Indexes
 * - Virtual properties
 * - Instance methods
 */

const studentSchema = new mongoose.Schema({
  // String type
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't include password in query results by default
  },
  
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EE', 'BBA', 'MBA']
  },
  
  // Number type (Integer)
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  
  // Number type (Double)
  cgpa: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 10
  },
  
  // Date type
  dateOfBirth: {
    type: Date,
    required: false
  },
  
  admissionDate: {
    type: Date,
    default: Date.now
  },
  
  // Boolean type
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Array of strings - demonstrates array data type
  skills: [{
    type: String,
    trim: true
  }],
  
  // Array of ObjectIds - demonstrates referencing
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  
  // Embedded document - demonstrates nested structure
  contact: {
    phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    alternatePhone: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
    },
    // Nested embedded document
    address: {
      street: String,
      landmark: String,
      area: String
    }
  },
  
  // Array of embedded documents
  attendance: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    courseName: String,
    totalClasses: {
      type: Number,
      default: 0
    },
    attendedClasses: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  }],
  
  // Parent/Guardian information - embedded document
  guardian: {
    name: String,
    relation: {
      type: String,
      enum: ['Father', 'Mother', 'Guardian']
    },
    phone: String,
    occupation: String
  },
  
  // Mixed type for additional flexible data
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
  
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'students' // Explicit collection name
});

// Indexes for performance optimization
studentSchema.index({ studentId: 1 }); // Single field index
studentSchema.index({ email: 1 }, { unique: true }); // Unique index
studentSchema.index({ department: 1, semester: 1 }); // Compound index
studentSchema.index({ name: 'text', 'contact.city': 'text' }); // Text index for search
studentSchema.index({ cgpa: -1 }); // Descending index for sorting

// Virtual property - doesn't get stored in MongoDB
studentSchema.virtual('age').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

// Instance method to calculate average attendance
studentSchema.methods.calculateAverageAttendance = function() {
  if (this.attendance.length === 0) return 0;
  
  const totalPercentage = this.attendance.reduce((sum, record) => {
    return sum + record.percentage;
  }, 0);
  
  return (totalPercentage / this.attendance.length).toFixed(2);
};

// Instance method to check if student is eligible for exams (75% attendance required)
studentSchema.methods.isEligibleForExams = function() {
  const avgAttendance = this.calculateAverageAttendance();
  return avgAttendance >= 75;
};

// Static method to find students by department
studentSchema.statics.findByDepartment = function(department) {
  return this.find({ department: department, isActive: true });
};

// Pre-save middleware
studentSchema.pre('save', function(next) {
  // Calculate attendance percentage for each course
  if (this.attendance && this.attendance.length > 0) {
    this.attendance.forEach(record => {
      if (record.totalClasses > 0) {
        record.percentage = ((record.attendedClasses / record.totalClasses) * 100).toFixed(2);
      }
    });
  }
  next();
});

// Export model
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
