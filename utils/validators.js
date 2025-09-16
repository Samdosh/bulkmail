const validator = require('validator');

/**
 * Validate email format using validator library
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  return validator.isEmail(email, {
    allow_utf8_local_part: false,
    require_tld: true,
    allow_ip_domain: false
  });
}

/**
 * Validate array of emails
 * @param {Array} emails - Array of emails to validate
 * @returns {Object} - Object with valid and invalid emails
 */
function validateEmailArray(emails) {
  if (!Array.isArray(emails)) {
    return {
      valid: [],
      invalid: [],
      error: 'Input must be an array'
    };
  }

  const valid = [];
  const invalid = [];

  emails.forEach(email => {
    if (isValidEmail(email)) {
      valid.push(email);
    } else {
      invalid.push(email);
    }
  });

  return { valid, invalid };
}

/**
 * Sanitize HTML content for email
 * @param {string} html - HTML content to sanitize
 * @returns {string} - Sanitized HTML
 */
function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Validate subject line
 * @param {string} subject - Email subject
 * @returns {Object} - Validation result
 */
function validateSubject(subject) {
  if (!subject || typeof subject !== 'string') {
    return {
      isValid: false,
      error: 'Subject is required and must be a string'
    };
  }

  if (subject.trim().length === 0) {
    return {
      isValid: false,
      error: 'Subject cannot be empty'
    };
  }

  if (subject.length > 200) {
    return {
      isValid: false,
      error: 'Subject must be 200 characters or less'
    };
  }

  return { isValid: true };
}

/**
 * Validate email body
 * @param {string} body - Email body content
 * @returns {Object} - Validation result
 */
function validateEmailBody(body) {
  if (!body || typeof body !== 'string') {
    return {
      isValid: false,
      error: 'Email body is required and must be a string'
    };
  }

  if (body.trim().length === 0) {
    return {
      isValid: false,
      error: 'Email body cannot be empty'
    };
  }

  if (body.length > 50000) {
    return {
      isValid: false,
      error: 'Email body must be 50,000 characters or less'
    };
  }

  return { isValid: true };
}

/**
 * Remove duplicate emails from array while preserving order
 * @param {Array} emails - Array of emails
 * @returns {Array} - Array with duplicates removed
 */
function removeDuplicateEmails(emails) {
  if (!Array.isArray(emails)) {
    return [];
  }

  return [...new Set(emails.map(email => email.toLowerCase()))];
}

/**
 * Validate bulk email request data
 * @param {Object} data - Request data
 * @returns {Object} - Validation result
 */
function validateBulkEmailData(data) {
  const errors = [];

  // Validate sender
  if (!isValidEmail(data.sender)) {
    errors.push('Invalid sender email address');
  }

  // Validate subject
  const subjectValidation = validateSubject(data.subject);
  if (!subjectValidation.isValid) {
    errors.push(subjectValidation.error);
  }

  // Validate body
  const bodyValidation = validateEmailBody(data.body);
  if (!bodyValidation.isValid) {
    errors.push(bodyValidation.error);
  }

  // Validate receivers
  if (!Array.isArray(data.receivers) || data.receivers.length === 0) {
    errors.push('Receivers must be a non-empty array');
  } else {
    const maxRecipients = parseInt(process.env.MAX_RECIPIENTS_PER_REQUEST) || 100;
    
    if (data.receivers.length > maxRecipients) {
      errors.push(`Maximum ${maxRecipients} recipients allowed per request`);
    }

    const emailValidation = validateEmailArray(data.receivers);
    if (emailValidation.invalid.length > 0) {
      errors.push(`Invalid email addresses: ${emailValidation.invalid.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

module.exports = {
  isValidEmail,
  validateEmailArray,
  sanitizeHtml,
  validateSubject,
  validateEmailBody,
  removeDuplicateEmails,
  validateBulkEmailData
};