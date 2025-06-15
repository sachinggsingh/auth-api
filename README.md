# Auth API

A robust and secure authentication API built with modern technologies, providing comprehensive user authentication and authorization services.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication system
- 👤 **User Management** - Complete user registration, login, and profile management)
- 🔄 **Token Management** - Access and refresh token handling
- 📧 **Email Verification** - Account verification via email
- 🔒 **Password Reset** - Secure password recovery system
- 🛡️ **Security** - Rate limiting, input validation, and security headers
- 📱 **Multi-device Support** - Session management across devices
- 🚀 **Scalable Architecture** - Built for production environments

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB/PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi/Express-validator
- **Security**: Helmet, bcrypt, rate-limiting
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB/PostgreSQL database
- SMTP server for email services

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sachinggsingh/auth-api.git
   cd auth-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database
   DATABASE_URL=mongodb://localhost:27017/auth-api
   # or for PostgreSQL: postgresql://username:password@localhost:5432/auth_api
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_SECRET=your-refresh-token-secret
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Client URL (for email links)
   CLIENT_URL=http://localhost:3000
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup**
   ```bash
   # For MongoDB (if using mongoose)
   npm run db:migrate
   
   # For PostgreSQL (if using Prisma/Sequelize)
   npm run db:migrate
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/verify-email` - Verify email address
- `POST /api/users/resend-verification` - Resend verification email
- `PUT /api/users/change-password` - Change user password

### Admin (Protected)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user account

## Request Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

## Authentication Flow

1. **Registration**: User provides email, password, and other details
2. **Email Verification**: Verification email sent to user
3. **Login**: User authenticates with email/password
4. **Token Generation**: JWT access and refresh tokens issued
5. **Protected Access**: Include Bearer token in Authorization header
6. **Token Refresh**: Use refresh token to get new access token

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Signed tokens with expiration
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Helmet.js for security headers
- **SQL Injection Protection**: Parameterized queries/ORM
- **XSS Protection**: Input sanitization

## Development

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Code Quality
```bash
# Linting
npm run lint

# Format code
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

### API Documentation
Access the Swagger documentation at: `http://localhost:3000/api/docs`

## Docker

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f api
```

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Deployment

### Environment Variables (Production)
Ensure all sensitive environment variables are properly configured:
- Use strong, unique JWT secrets
- Configure secure database connections
- Set up proper SMTP credentials
- Enable HTTPS in production

### Health Check
The API includes a health check endpoint:
```bash
GET /api/health
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Token expired |
| `AUTH_003` | Invalid token |
| `USER_001` | User not found |
| `USER_002` | Email already exists |
| `USER_003` | Email not verified |
| `VALID_001` | Validation error |
| `RATE_001` | Rate limit exceeded |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [documentation](http://localhost:3000/api/docs)
- Contact the maintainer: [sachinggsingh](https://github.com/sachinggsingh)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

**Built with ❤️ by [Sachin Singh](https://github.com/sachinggsingh)**
