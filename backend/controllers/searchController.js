const { Student, Event, Course } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Search Controller
 * 
 * Demonstrates:
 * - MongoDB Text Search
 * - $text operator
 * - $search
 * - Text score
 * - Text indexes
 */

// @desc    Search events using text search
// @route   GET /api/search/events
// @access  Public
exports.searchEvents = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a search query'
    });
  }

  // MongoDB Text Search demonstration
  // Using $text and $search operators
  const events = await Event.find(
    {
      $text: {
        $search: q, // Text search operator
        $caseSensitive: false
      }
    },
    {
      // Projection with text score
      score: { $meta: 'textScore' }
    }
  )
    .sort({ score: { $meta: 'textScore' } }) // Sort by relevance
    .limit(20);

  res.status(200).json({
    success: true,
    query: q,
    count: events.length,
    data: events
  });
});

// @desc    Search students using text search
// @route   GET /api/search/students
// @access  Public
exports.searchStudents = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a search query'
    });
  }

  // Text search on students
  const students = await Student.find(
    {
      $text: {
        $search: q
      },
      isActive: true
    },
    {
      score: { $meta: 'textScore' }
    }
  )
    .select('studentId name email department semester contact.city')
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

  res.status(200).json({
    success: true,
    query: q,
    count: students.length,
    data: students
  });
});

// @desc    Search courses using text search
// @route   GET /api/search/courses
// @access  Public
exports.searchCourses = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a search query'
    });
  }

  const courses = await Course.find(
    {
      $text: {
        $search: q
      },
      isActive: true
    },
    {
      score: { $meta: 'textScore' }
    }
  )
    .populate('faculty', 'name email')
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

  res.status(200).json({
    success: true,
    query: q,
    count: courses.length,
    data: courses
  });
});

// @desc    Global search across multiple collections
// @route   GET /api/search/global
// @access  Public
exports.globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a search query'
    });
  }

  // Search across multiple collections in parallel
  const [students, events, courses] = await Promise.all([
    Student.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .select('studentId name email department')
      .sort({ score: { $meta: 'textScore' } })
      .limit(5),
    
    Event.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .select('title category eventDate venue')
      .sort({ score: { $meta: 'textScore' } })
      .limit(5),
    
    Course.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .select('courseName courseCode department semester')
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
  ]);

  res.status(200).json({
    success: true,
    query: q,
    results: {
      students: {
        count: students.length,
        data: students
      },
      events: {
        count: events.length,
        data: events
      },
      courses: {
        count: courses.length,
        data: courses
      }
    },
    totalResults: students.length + events.length + courses.length
  });
});
