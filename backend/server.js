const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Campus API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/enrollment', require('./routes/enrollmentRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Smart Campus Management & Analytics System API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      students: '/api/students',
      analytics: '/api/analytics',
      enrollment: '/api/enrollment',
      search: '/api/search'
    },
    mongodb_concepts_demonstrated: [
      'CRUD Operations',
      'Query Operators',
      'Aggregation Framework',
      'Text Search',
      'Transactions',
      'Indexing',
      'Schema Design',
      'Referencing & Embedding',
      'Arrays & Nested Documents'
    ]
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`💾 MongoDB URI: ${process.env.MONGODB_URI || 'Not configured'}`);
  console.log(`\n✨ Smart Campus Management System API Started\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Promise Rejection: ${err.message}`);
  // Close server & exit
  server.close(() => process.exit(1));
});

module.exports = app;
