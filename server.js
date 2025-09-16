require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const emailRoutes = require('./routes/emailRoutes');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Routes
app.use('/api', emailRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Bulk Email API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  logger.info(`Bulk Email API server running on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
});

module.exports = app;