const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

/**
 * Analytics Routes
 * Demonstrates MongoDB Aggregation Framework
 */

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/attendance', analyticsController.getAttendanceAnalytics);
router.get('/results', analyticsController.getResultAnalytics);
router.get('/student-performance/:id', analyticsController.getStudentPerformance);
router.get('/assignments', analyticsController.getAssignmentAnalytics);
router.get('/events', analyticsController.getEventAnalytics);
router.get('/activity', analyticsController.getActivityAnalytics);

module.exports = router;
