const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { emailLimiter } = require('../middleware/rateLimiter');
const { validateBulkEmail } = require('../middleware/validation');

// Bulk email endpoint
router.post('/send-bulk-email', 
  emailLimiter, 
  validateBulkEmail, 
  emailController.sendBulkEmail
);

// Send single email endpoint
router.post('/send-email', 
  emailLimiter, 
  emailController.sendSingleEmail
);

// Get email sending status
router.get('/email-status/:requestId', emailController.getEmailStatus);

module.exports = router;