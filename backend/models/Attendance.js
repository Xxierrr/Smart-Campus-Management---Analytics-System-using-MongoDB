const mongoose = require('mongoose');

/**
 * Attendance Model
 * 
 * Demonstrates:
 * - Attendance tracking
 * - References to students and courses
 * - Date handling
 * - Arrays for marking attendance
 */

const attendanceSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  courseName: String, // Denormalized
  
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  
  semester: {
    type: Number,
    required: true
  },
  
  department: {
    type: String,
    required: true
  },
  
  // Array of student attendance records
  students: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    studentName: String,
    studentRollNo: String,
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      required: true
    },
    remarks: String
  }],
  
  totalStudents: {
    type: Number,
    default: 0
  },
  
  presentCount: {
    type: Number,
    default: 0
  },
  
  absentCount: {
    type: Number,
    default: 0
  },
  
  attendancePercentage: {
    type: Number,
    default: 0
  },
  
  classType: {
    type: String,
    enum: ['Lecture', 'Lab', 'Tutorial', 'Practical'],
    default: 'Lecture'
  },
  
  topic: String,
  
  remarks: String
  
}, {
  timestamps: true,
  collection: 'attendance'
});

// Indexes
attendanceSchema.index({ course: 1, date: 1 });
attendanceSchema.index({ date: -1 });
attendanceSchema.index({ department: 1, semester: 1 });
attendanceSchema.index({ 'students.studentId': 1 });

// Pre-save middleware to calculate counts
attendanceSchema.pre('save', function(next) {
  if (this.students && this.students.length > 0) {
    this.totalStudents = this.students.length;
    this.presentCount = this.students.filter(s => s.status === 'Present' || s.status === 'Late').length;
    this.absentCount = this.students.filter(s => s.status === 'Absent').length;
    
    if (this.totalStudents > 0) {
      this.attendancePercentage = ((this.presentCount / this.totalStudents) * 100).toFixed(2);
    }
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
