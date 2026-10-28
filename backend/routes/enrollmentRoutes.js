const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

/**
 * Enrollment Routes
 * Demonstrates MongoDB Transactions
 */

router.post('/', enrollmentController.enrollStudent);
router.delete('/', enrollmentController.unenrollStudent);
router.get('/stats', enrollmentController.getEnrollmentStats);

module.exports = router;
