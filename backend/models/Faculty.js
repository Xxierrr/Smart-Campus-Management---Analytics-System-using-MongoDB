const mongoose = require('mongoose');

/**
 * Faculty Model
 * 
 * Demonstrates:
 * - Document structure for faculty members
 * - Embedded documents for qualifications
 * - Arrays for subjects and courses
 * - Referencing departments
 */

const facultySchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  password: {
    type: String,
    required: true,
    select: false
  },
  
  department: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EE', 'BBA', 'MBA']
  },
  
  designation: {
    type: String,
    required: true,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'HOD']
  },
  
  specialization: {
    type: String,
    required: true
  },
  
  experience: {
    type: Number, // Years of experience
    required: true,
    min: 0
  },
  
  // Embedded document for contact
  contact: {
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String,
    officeRoom: String,
    city: String,
    state: String
  },
  
  // Array of qualifications - embedded documents
  qualifications: [{
    degree: {
      type: String,
      required: true
    },
    field: String,
    institution: String,
    year: Number
  }],
  
  // Array of subjects they teach
  subjects: [{
    type: String,
    trim: true
  }],
  
  // Array of course references
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  
  // Publications and research
  publications: [{
    title: String,
    journal: String,
    year: Number,
    doi: String
  }],
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  joiningDate: {
    type: Date,
    default: Date.now
  }
  
}, {
  timestamps: true,
  collection: 'faculty'
});

// Indexes
facultySchema.index({ facultyId: 1 });
facultySchema.index({ email: 1 }, { unique: true });
facultySchema.index({ department: 1 });
facultySchema.index({ name: 'text', specialization: 'text' });

// Virtual for total publications
facultySchema.virtual('totalPublications').get(function() {
  return this.publications ? this.publications.length : 0;
});

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
