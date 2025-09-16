# Bulk Email API

A robust Node.js REST API for sending bulk emails with rate limiting, validation, and detailed status tracking.

## Features

- 🚀 **Bulk Email Sending**: Send emails to multiple recipients efficiently
- 🔒 **Security**: Built-in rate limiting and input validation
- 📊 **Status Tracking**: Real-time progress monitoring for bulk operations
- 🔄 **Batch Processing**: Controlled email sending to avoid service limits
- 📝 **Comprehensive Logging**: Winston-based logging system
- ⚡ **Async Processing**: Non-blocking bulk email operations
- 🛡️ **Error Handling**: Detailed error responses and recovery

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd bulk-email-api

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your email credentials
nano .env
```

### 3. Configure Email Service

Update your `.env` file:

```bash
# For Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# For custom SMTP
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
```

### 4. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Send Bulk Email

Send emails to multiple recipients with batch processing and status tracking.

```http
POST /api/send-bulk-email
Content-Type: application/json

{
  "sender": "your-email@example.com",
  "subject": "Newsletter Update",
  "body": "<h1>Hello!</h1><p>This is our newsletter...</p>",
  "receivers": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}
```

**Response:**
```json
{
  "message": "Bulk email processing started",
  "requestId": "uuid-here",
  "totalRecipients": 3,
  "statusUrl": "/api/email-status/uuid-here"
}
```

### Send Single Email

Send email to a single recipient.

```http
POST /api/send-email
Content-Type: application/json

{
  "sender": "your-email@example.com",
  "receiver": "recipient@example.com",
  "subject": "Welcome!",
  "body": "<h1>Welcome to our service!</h1>"
}
```

### Check Email Status

Monitor the progress of bulk email operations.

```http
GET /api/email-status/{requestId}
```

**Response:**
```json
{
  "requestId": "uuid-here",
  "status": "processing",
  "total": 100,
  "processed": 45,
  "successful": 42,
  "failed": 3,
  "startTime": "2024-01-15T10:30:00.000Z",
  "results": [
    {
      "email": "user1@example.com",
      "status": "sent",
      "messageId": "message-id-here",
      "timestamp": "2024-01-15T10:30:05.000Z"
    }
  ]
}
```

### Health Check

```http
GET /health
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `EMAIL_SERVICE` | Email service (gmail, outlook, etc.) | `gmail` |
| `EMAIL_USER` | Email username | Required |
| `EMAIL_PASS` | Email password/app password | Required |
| `SMTP_HOST` | Custom SMTP host | Optional |
| `SMTP_PORT` | Custom SMTP port | `587` |
| `SMTP_SECURE` | Use TLS | `false` |
| `MAX_RECIPIENTS_PER_REQUEST` | Max recipients per bulk request | `100` |
| `EMAIL_BATCH_SIZE` | Emails per batch | `10` |
| `BATCH_DELAY_MS` | Delay between batches (ms) | `1000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `10` |
| `LOG_LEVEL` | Logging level | `info` |

### Email Service Setup

#### Gmail Setup
1. Enable 2-factor authentication
2. Generate an App Password
3. Use App Password in `EMAIL_PASS`

#### Custom SMTP
Set `SMTP_HOST`, `SMTP_PORT`, and authentication details.

## Rate Limiting

- **Email endpoints**: 10 requests per 15 minutes per IP
- **General endpoints**: 100 requests per 15 minutes per IP
- **Bulk operations**: Maximum 100 recipients per request

## Security Features

- Input validation and sanitization
- Email format validation
- Rate limiting per IP address
- HTML content sanitization
- Helmet.js security headers
- CORS protection

## Error Handling

The API provides detailed error responses:

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "receivers",
      "message": "Invalid email addresses: invalid-email",
      "value": "invalid-email"
    }
  ]
}
```

## Logging

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- Console (development mode)

## Testing

```bash
# Run tests
npm test

# Test with curl
curl -X POST http://localhost:3000/api/send-bulk-email \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "test@example.com",
    "subject": "Test Email",
    "body": "<h1>Test</h1>",
    "receivers": ["recipient@example.com"]
  }'
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use process manager (PM2, Docker)
3. Configure reverse proxy (Nginx)
4. Set up SSL/TLS certificates
5. Use database for status storage (replace in-memory store)
6. Configure email service with higher limits

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue in the repository or contact the development team.