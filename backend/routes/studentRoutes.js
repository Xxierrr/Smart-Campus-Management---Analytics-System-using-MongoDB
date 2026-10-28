const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

/**
 * Student Routes
 * Demonstrates RESTful API design with MongoDB
 */

// Standard CRUD routes
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

// Array operation routes
router.post('/:id/skills', studentController.addSkill);
router.delete('/:id/skills/:skill', studentController.removeSkill);

// Query operator demonstration routes
router.get('/analytics/low-attendance', studentController.getLowAttendanceStudents);
router.get('/analytics/cgpa-range', studentController.getStudentsByCGPARange);
router.get('/analytics/by-departments', studentController.getStudentsByDepartments);

module.exports = router;
