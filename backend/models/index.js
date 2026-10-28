/**
 * Central export for all models
 * Simplifies importing models throughout the application
 */

const Student = require('./Student');
const Faculty = require('./Faculty');
const Course = require('./Course');
const Attendance = require('./Attendance');
const Assignment = require('./Assignment');
const Result = require('./Result');
const Event = require('./Event');
const Notification = require('./Notification');
const ActivityLog = require('./ActivityLog');

module.exports = {
  Student,
  Faculty,
  Course,
  Attendance,
  Assignment,
  Result,
  Event,
  Notification,
  ActivityLog
};
