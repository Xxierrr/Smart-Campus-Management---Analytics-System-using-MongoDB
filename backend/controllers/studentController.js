const { Student, ActivityLog } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Student Controller
 * 
 * Demonstrates:
 * - CRUD operations
 * - Query operators
 * - Projection
 * - Sorting and limiting
 * - Population (referencing)
 * - Error handling
 */

// @desc    Get all students
// @route   GET /api/students
// @access  Public (for demo)
exports.getAllStudents = asyncHandler(async (req, res) => {
  const { 
    department, 
    semester, 
    search, 
    page = 1, 
    limit = 10,
    sort = '-createdAt'
  } = req.query;

  // Build query
  let query = { isActive: true };

  // Query operators demonstration
  if (department) {
    query.department = department; // $eq operator (implicit)
  }

  if (semester) {
    query.semester = parseInt(semester);
  }

  // Text search demonstration
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  // Projection - select specific fields
  const students = await Student.find(query)
    .select('studentId name email department semester cgpa contact.phone contact.city')
    .sort(sort) // Sorting demonstration
    .limit(parseInt(limit)) // Limiting demonstration
    .skip(skip)
    .populate('enrolledCourses', 'courseName courseCode credits'); // Population demonstration

  // Count total documents
  const total = await Student.countDocuments(query);

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: students
  });
});

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Public
exports.getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('enrolledCourses', 'courseName courseCode credits faculty');

  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

// @desc    Create new student
// @route   POST /api/students
// @access  Private
exports.createStudent = asyncHandler(async (req, res) => {
  // Create student
  const student = await Student.create(req.body);

  // Log activity
  await ActivityLog.logActivity({
    user: {
      userId: student._id,
      userType: 'Student',
      name: student.name,
      email: student.email
    },
    action: 'Create',
    entity: 'Student',
    entityId: student._id,
    description: `New student ${student.name} (${student.studentId}) created`,
    status: 'Success'
  });

  res.status(201).json({
    success: true,
    message: 'Student created successfully',
    data: student
  });
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = asyncHandler(async (req, res) => {
  // $set operator demonstration (handled by Mongoose)
  let student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }

  // Update student
  student = await Student.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true, // Return updated document
      runValidators: true // Run schema validators
    }
  );

  // Log activity
  await ActivityLog.logActivity({
    user: {
      userId: student._id,
      userType: 'Student',
      name: student.name,
      email: student.email
    },
    action: 'Update',
    entity: 'Student',
    entityId: student._id,
    description: `Student ${student.name} profile updated`,
    status: 'Success'
  });

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: student
  });
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
exports.deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }

  // Soft delete - set isActive to false
  student.isActive = false;
  await student.save();

  // Log activity
  await ActivityLog.logActivity({
    user: {
      userId: student._id,
      userType: 'Student',
      name: student.name,
      email: student.email
    },
    action: 'Delete',
    entity: 'Student',
    entityId: student._id,
    description: `Student ${student.name} deleted`,
    status: 'Success'
  });

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully',
    data: {}
  });
});

// @desc    Add skill to student
// @route   POST /api/students/:id/skills
// @access  Private
exports.addSkill = asyncHandler(async (req, res) => {
  const { skill } = req.body;

  // $push operator demonstration
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { $push: { skills: skill } }, // $push to add to array
    { new: true }
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Skill added successfully',
    data: student
  });
});

// @desc    Remove skill from student
// @route   DELETE /api/students/:id/skills/:skill
// @access  Private
exports.removeSkill = asyncHandler(async (req, res) => {
  const { skill } = req.params;

  // $pull operator demonstration
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { $pull: { skills: skill } }, // $pull to remove from array
    { new: true }
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      error: 'Student not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Skill removed successfully',
    data: student
  });
});

// @desc    Get students with low attendance
// @route   GET /api/students/low-attendance
// @access  Public
exports.getLowAttendanceStudents = asyncHandler(async (req, res) => {
  // Query operators: $lt (less than)
  const students = await Student.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $unwind: '$attendance'
    },
    {
      $match: {
        'attendance.percentage': { $lt: 75 } // $lt operator
      }
    },
    {
      $group: {
        _id: '$_id',
        studentId: { $first: '$studentId' },
        name: { $first: '$name' },
        department: { $first: '$department' },
        semester: { $first: '$semester' },
        avgAttendance: { $avg: '$attendance.percentage' }
      }
    },
    {
      $sort: { avgAttendance: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// @desc    Get students by CGPA range
// @route   GET /api/students/cgpa-range
// @access  Public
exports.getStudentsByCGPARange = asyncHandler(async (req, res) => {
  const { min = 0, max = 10 } = req.query;

  // Query operators: $gte (greater than or equal), $lte (less than or equal)
  const students = await Student.find({
    cgpa: { 
      $gte: parseFloat(min), // $gte operator
      $lte: parseFloat(max)  // $lte operator
    },
    isActive: true
  })
    .select('studentId name department semester cgpa')
    .sort({ cgpa: -1 });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// @desc    Get students by multiple departments
// @route   GET /api/students/departments
// @access  Public
exports.getStudentsByDepartments = asyncHandler(async (req, res) => {
  const { departments } = req.query; // comma-separated departments

  if (!departments) {
    return res.status(400).json({
      success: false,
      error: 'Please provide departments'
    });
  }

  const deptArray = departments.split(',');

  // Query operator: $in
  const students = await Student.find({
    department: { $in: deptArray }, // $in operator
    isActive: true
  })
    .select('studentId name department semester')
    .sort({ department: 1, semester: 1 });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});
