const mongoose = require('mongoose');

/**
 * Assignment Model
 * 
 * Demonstrates:
 * - Assignment submission tracking
 * - References and embedded documents
 * - Date handling
 * - Status tracking
 */

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  courseName: String,
  
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  
  department: {
    type: String,
    required: true
  },
  
  semester: {
    type: Number,
    required: true
  },
  
  maxMarks: {
    type: Number,
    required: true,
    min: 0
  },
  
  dueDate: {
    type: Date,
    required: true
  },
  
  assignedDate: {
    type: Date,
    default: Date.now
  },
  
  // Array of submissions - embedded documents
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    studentName: String,
    studentRollNo: String,
    submittedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Submitted', 'Late', 'Pending', 'Evaluated'],
      default: 'Pending'
    },
    fileUrl: String,
    remarks: String,
    marksObtained: {
      type: Number,
      min: 0
    },
    feedback: String,
    evaluatedDate: Date,
    isLate: {
      type: Boolean,
      default: false
    }
  }],
  
  totalSubmissions: {
    type: Number,
    default: 0
  },
  
  pendingSubmissions: {
    type: Number,
    default: 0
  },
  
  attachments: [{
    filename: String,
    url: String
  }],
  
  isActive: {
    type: Boolean,
    default: true
  }
  
}, {
  timestamps: true,
  collection: 'assignments'
});

// Indexes
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ faculty: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ department: 1, semester: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

// Check if assignment is overdue
assignmentSchema.methods.isOverdue = function() {
  return new Date() > this.dueDate;
};

// Pre-save middleware
assignmentSchema.pre('save', function(next) {
  if (this.submissions && this.submissions.length > 0) {
    this.totalSubmissions = this.submissions.filter(s => 
      s.status === 'Submitted' || s.status === 'Late' || s.status === 'Evaluated'
    ).length;
    
    this.pendingSubmissions = this.submissions.filter(s => 
      s.status === 'Pending'
    ).length;
    
    // Check if submissions are late
    this.submissions.forEach(sub => {
      if (sub.submittedDate && sub.submittedDate > this.dueDate) {
        sub.isLate = true;
        if (sub.status === 'Submitted') {
          sub.status = 'Late';
        }
      }
    });
  }
  next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
