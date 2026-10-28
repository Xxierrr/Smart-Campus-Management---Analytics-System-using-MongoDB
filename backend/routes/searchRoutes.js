const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

/**
 * Search Routes
 * Demonstrates MongoDB Text Search
 */

router.get('/events', searchController.searchEvents);
router.get('/students', searchController.searchStudents);
router.get('/courses', searchController.searchCourses);
router.get('/global', searchController.globalSearch);

module.exports = router;
