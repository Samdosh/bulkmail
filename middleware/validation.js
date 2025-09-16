const { body, validationResult } = require('express-validator');
const { isValidEmail } = require('../utils/validators');

const validateBulkEmail = [
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),
    
  body('body')
    .notEmpty()
    .withMessage('Email body is required')
    .isLength({ min: 1, max: 50000 })
    .withMessage('Email body must be between 1 and 50,000 characters'),
    
  body('receivers')
    .isArray({ min: 1 })
    .withMessage('Receivers must be a non-empty array')
    .custom((receivers) => {
      const maxRecipients = parseInt(process.env.MAX_RECIPIENTS_PER_REQUEST) || 100;
      
      if (receivers.length > maxRecipients) {
        throw new Error(`Maximum ${maxRecipients} recipients allowed per request`);
      }
      
      // Validate each email in the array
      const invalidEmails = receivers.filter(email => !isValidEmail(email));
      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
      }
      
      // Check for duplicates
      const uniqueEmails = [...new Set(receivers)];
      if (uniqueEmails.length !== receivers.length) {
        throw new Error('Duplicate email addresses found in receivers list');
      }
      
      return true;
    }),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    
    next();
  }
];

const validateSingleEmail = [
  body('receiver')
    .isEmail()
    .withMessage('Receiver must be a valid email address')
    .normalizeEmail(),
    
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject must be between 1 and 200 characters'),
    
  body('body')
    .notEmpty()
    .withMessage('Email body is required')
    .isLength({ min: 1, max: 50000 })
    .withMessage('Email body must be between 1 and 50,000 characters'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }
    
    next();
  }
];

module.exports = {
  validateBulkEmail,
  validateSingleEmail
};