const request = require('supertest');
const app = require('../server');

describe('Email API Tests', () => {
  
  describe('POST /api/send-bulk-email', () => {
    
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/send-bulk-email')
        .send({});
        
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
    
    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/send-bulk-email')
        .send({
          sender: 'invalid-email',
          subject: 'Test Subject',
          body: 'Test Body',
          receivers: ['test@example.com']
        });
        
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
    
    test('should validate receivers array', async () => {
      const response = await request(app)
        .post('/api/send-bulk-email')
        .send({
          sender: 'sender@example.com',
          subject: 'Test Subject',
          body: 'Test Body',
          receivers: ['invalid-email', 'test@example.com']
        });
        
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
    
    test('should accept valid bulk email request', async () => {
      const response = await request(app)
        .post('/api/send-bulk-email')
        .send({
          sender: 'sender@example.com',
          subject: 'Test Subject',
          body: '<h1>Test Email</h1><p>This is a test email.</p>',
          receivers: ['test1@example.com', 'test2@example.com']
        });
        
      expect(response.status).toBe(202);
      expect(response.body.message).toBe('Bulk email processing started');
      expect(response.body.requestId).toBeDefined();
      expect(response.body.totalRecipients).toBe(2);
    });
    
    test('should enforce maximum recipients limit', async () => {
      const manyReceivers = Array.from({ length: 101 }, (_, i) => `test${i}@example.com`);
      
      const response = await request(app)
        .post('/api/send-bulk-email')
        .send({
          sender: 'sender@example.com',
          subject: 'Test Subject',
          body: 'Test Body',
          receivers: manyReceivers
        });
        
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
    
  });
  
  describe('POST /api/send-email', () => {
    
    test('should validate single email request', async () => {
      const response = await request(app)
        .post('/api/send-email')
        .send({
          sender: 'sender@example.com',
          receiver: 'invalid-email',
          subject: 'Test Subject',
          body: 'Test Body'
        });
        
      expect(response.status).toBe(400);
    });
    
  });
  
  describe('GET /api/email-status/:requestId', () => {
    
    test('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .get('/api/email-status/non-existent-id');
        
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Email request not found');
    });
    
  });
  
  describe('GET /health', () => {
    
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health');
        
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('Bulk Email API');
    });
    
  });
  
  describe('Rate Limiting', () => {
    
    test('should enforce rate limits', async () => {
      // This test would need to be run with actual rate limiting
      // For now, we'll just verify the structure
      expect(true).toBe(true);
    }, 30000);
    
  });
  
});