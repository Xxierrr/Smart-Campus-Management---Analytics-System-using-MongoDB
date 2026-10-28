const mongoose = require('mongoose');

/**
 * Result Model
 * 
 * Demonstrates:
 * - Exam result management
 * - References and calculations
 * - Grade computation
 */

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  studentName: String,
  studentRollNo: String,
  
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  courseName: String,
  courseCode: String,
  
  department: {
    type: String,
    required: true
  },
  
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  
  academicYear: {
    type: String,
    required: true
  },
  
  examinationType: {
    type: String,
    enum: ['Mid-Term', 'End-Term', 'Quiz', 'Internal', 'Final'],
    required: true
  },
  
  // Marks breakdown
  marks: {
    theory: {
      obtained: {
        type: Number,
        default: 0,
        min: 0
      },
      total: {
        type: Number,
        default: 100
      }
    },
    practical: {
      obtained: {
        type: Number,
        default: 0,
        min: 0
      },
      total: {
        type: Number,
        default: 0
      }
    },
    internal: {
      obtained: {
        type: Number,
        default: 0,
        min: 0
      },
      total: {
        type: Number,
        default: 0
      }
    }
  },
  
  totalObtained: {
    type: Number,
    default: 0
  },
  
  totalMarks: {
    type: Number,
    default: 100
  },
  
  percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'I', 'W'],
    default: 'F'
  },
  
  gradePoint: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  
  credits: {
    type: Number,
    default: 4
  },
  
  status: {
    type: String,
    enum: ['Pass', 'Fail', 'Absent', 'Withheld'],
    default: 'Fail'
  },
  
  remarks: String,
  
  publishedDate: {
    type: Date,
    default: Date.now
  },
  
  isPublished: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true,
  collection: 'results'
});

// Indexes
resultSchema.index({ student: 1, course: 1, examinationType: 1 });
resultSchema.index({ department: 1, semester: 1 });
resultSchema.index({ academicYear: 1 });
resultSchema.index({ grade: 1 });
resultSchema.index({ percentage: -1 });

// Calculate grade based on percentage
function calculateGrade(percentage) {
  if (percentage >= 90) return { grade: 'A+', gradePoint: 10, status: 'Pass' };
  if (percentage >= 80) return { grade: 'A', gradePoint: 9, status: 'Pass' };
  if (percentage >= 70) return { grade: 'B+', gradePoint: 8, status: 'Pass' };
  if (percentage >= 60) return { grade: 'B', gradePoint: 7, status: 'Pass' };
  if (percentage >= 50) return { grade: 'C+', gradePoint: 6, status: 'Pass' };
  if (percentage >= 40) return { grade: 'C', gradePoint: 5, status: 'Pass' };
  if (percentage >= 33) return { grade: 'D', gradePoint: 4, status: 'Pass' };
  return { grade: 'F', gradePoint: 0, status: 'Fail' };
}

// Pre-save middleware to calculate totals and grades
resultSchema.pre('save', function(next) {
  // Calculate total obtained marks
  this.totalObtained = 
    (this.marks.theory.obtained || 0) + 
    (this.marks.practical.obtained || 0) + 
    (this.marks.internal.obtained || 0);
  
  // Calculate total marks
  this.totalMarks = 
    (this.marks.theory.total || 0) + 
    (this.marks.practical.total || 0) + 
    (this.marks.internal.total || 0);
  
  // Calculate percentage
  if (this.totalMarks > 0) {
    this.percentage = ((this.totalObtained / this.totalMarks) * 100).toFixed(2);
  }
  
  // Calculate grade and status
  const gradeInfo = calculateGrade(this.percentage);
  this.grade = gradeInfo.grade;
  this.gradePoint = gradeInfo.gradePoint;
  this.status = gradeInfo.status;
  
  next();
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
