const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {

// log username for sanity (do NOT log the password)
console.log("SMTP user from env:", process.env.EMAIL_USER);
    
this.transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  port: 465,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
    tls: {
    rejectUnauthorized: false,
  },

  connectionTimeout: 60000,
   greetingTimeout: 60000,  // wait longer for the initial 220
  logger: true, // logs protocol traffic to console (helpful for debugging)
  debug: true,
});

    this.batchSize = parseInt(process.env.EMAIL_BATCH_SIZE, 10) || 10;
    this.batchDelay = parseInt(process.env.BATCH_DELAY_MS, 10) || 1000;
    this.perEmailDelay = parseInt(process.env.PER_EMAIL_DELAY_MS, 10) || 500;

    this.sender = `"${process.env.FROM_NAME}" <${process.env.EMAIL_USER}>`
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified successfully (Titan SMTP)');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }

  async sendWithRetries(mailOptions, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (err) {
      const isTimeout = err && err.code === 'ETIMEDOUT';
      console.warn(`Attempt ${i} failed${isTimeout ? ' (timeout)' : ''}: ${err.message}`);
      if (i === attempts) throw err;
      // exponential backoff: e.g., 2s, then 4s
      await this.delay(2000 * i);
    }
  }
}

  async sendEmail(mailOptions) {
  try {
    const info = await this.sendWithRetries(mailOptions);
    logger.info(`Email sent successfully to: ${mailOptions.to}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${mailOptions.to}:`, error.message || error);
    throw error;
  }
}

  async sendBulkEmails({ sender, subject, body, receivers, onProgress }) {
    const results = {
      successful: [],
      failed: [],
      total: receivers.length
    };

    let processed = 0;

    for (let i = 0; i < receivers.length; i += this.batchSize) {
      const batch = receivers.slice(i, i + this.batchSize);
      
      for (const receiver of batch) {
        try {
          const mailOptions = {
            from: sender,
            to: receiver,
            subject: subject,
            html: body,
            text: this.stripHtml(body)
          };

          const info = await this.sendEmail(mailOptions);
          
          const successResult = {
            email: receiver,
            messageId: info.messageId,
            status: 'sent',
            timestamp: new Date().toISOString()
          };
          
          results.successful.push(successResult);
          processed++;

          if (onProgress) {
            onProgress({
              processed,
              successful: results.successful.length,
              failed: results.failed.length,
              results: [...results.successful, ...results.failed]
            });
          }
          
        } catch (error) {
          const failResult = {
            email: receiver,
            error: error.message || error,
            status: 'failed',
            timestamp: new Date().toISOString()
          };
          
          results.failed.push(failResult);
          processed++;

          if (onProgress) {
            onProgress({
              processed,
              successful: results.successful.length,
              failed: results.failed.length,
              results: [...results.successful, ...results.failed]
            });
          }
        }

        // small gap between individual emails
        await this.delay(this.perEmailDelay);

      }

      if (i + this.batchSize < receivers.length) {
        await this.delay(this.batchDelay);
      }
    }

    logger.info(`Bulk email completed: ${results.successful.length}/${results.total} successful`);
    return results;
  }

  stripHtml(html) {
     // naive fallback; you can swap in a library (e.g., html-to-text) later
    return typeof html === 'string' ? html.replace(/<[^>]*>/g, '') : '';
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const emailService = new EmailService();
emailService.verifyConnection();
module.exports = emailService;
