# Password-Based Authentication Implementation

This document describes the implementation of password-based authentication with email activation for the Moveo Fleet Management System.

## Overview

The system now supports both OTP-based and password-based authentication:

1. **Staff User Creation**: Staff creates users with email addresses
2. **Email Activation**: Users receive activation emails with links
3. **Password Setup**: Users click activation links to set passwords
4. **Password Login**: Users can login with username/password
5. **Password Reset**: Users can reset passwords via email

## New Features

### Backend Changes

#### Database Schema Updates
- Added `email` field to `User` model (unique)
- Added `isActive` field to `User` model (default: false)
- Enhanced `UserActivation` model with `isUsed` and `createdAt` fields
- Enhanced `UserAuth` model with `createdAt` and `updatedAt` fields

#### New API Endpoints
- `POST /api/auth/users` - Create user with email (updated)
- `POST /api/auth/activate` - Activate account and set password
- `POST /api/auth/login-password` - Login with username/password
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with code

#### Email Service
- Integrated nodemailer for sending activation and reset emails
- HTML email templates with responsive design
- Configurable SMTP settings

### Frontend Changes

#### New Pages
- `ActivateAccount.tsx` - Account activation page
- `ResetPassword.tsx` - Password reset page

#### Updated Login Page
- Toggle between Password and OTP login modes
- Forgot password functionality
- Enhanced UI with mode switching

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the `moveo-core` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://moveo_user:moveo_password@localhost:5432/moveo_fleet?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
JWT_EXPIRES_IN="24h"

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
API_DOCS_PATH=/api-docs

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3001

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. Database Migration

Run the database migration to update the schema:

```bash
cd moveo-core
npm run db:push
```

### 3. Install Dependencies

```bash
cd moveo-core
npm install nodemailer @types/nodemailer
```

### 4. Start the Backend

```bash
cd moveo-core
npm run dev
```

### 5. Start the Frontend

```bash
cd moveo
npm start
```

## Testing the Flow

### 1. Create User (Staff)
```bash
curl -X POST http://localhost:3000/api/auth/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  }'
```

### 2. Check Email
- User receives activation email
- Click the activation link (or copy the activation code)

### 3. Activate Account
```bash
curl -X POST http://localhost:3000/api/auth/activate \
  -H "Content-Type: application/json" \
  -d '{
    "activationCode": "ACTIVATION_CODE_FROM_EMAIL",
    "password": "newpassword123",
    "username": "johndoe"
  }'
```

### 4. Login with Password
```bash
curl -X POST http://localhost:3000/api/auth/login-password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "newpassword123"
  }'
```

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate an app password
3. Use the app password in `SMTP_PASS`

### Mailtrap (Testing)
1. Sign up at mailtrap.io
2. Use sandbox SMTP settings
3. Emails will be captured for testing

## Security Features

- **Password Hashing**: bcrypt with salt rounds of 12
- **Activation Expiry**: Activation links expire in 24 hours
- **Reset Expiry**: Password reset links expire in 1 hour
- **Email Validation**: Proper email format validation
- **Rate Limiting**: Consider implementing rate limiting for production
- **Account Lockout**: Consider implementing account lockout after failed attempts

## Backward Compatibility

The system maintains full backward compatibility with the existing OTP authentication:
- Existing OTP endpoints continue to work
- Existing users can still use OTP login
- No breaking changes to existing functionality

## Production Considerations

1. **Email Service**: Use a reliable email service (SendGrid, AWS SES, etc.)
2. **Rate Limiting**: Implement rate limiting on auth endpoints
3. **Monitoring**: Add logging and monitoring for auth events
4. **Security**: Use strong JWT secrets and HTTPS
5. **Database**: Regular backups and proper indexing
6. **Error Handling**: Comprehensive error handling and user feedback

## Troubleshooting

### Common Issues

1. **Email not sending**: Check SMTP configuration and credentials
2. **Activation link not working**: Verify FRONTEND_URL configuration
3. **Database errors**: Ensure schema is up to date with `npm run db:push`
4. **CORS issues**: Check CORS_ORIGIN configuration

### Debug Mode

Set `NODE_ENV=development` to enable detailed error messages and logging.

## API Documentation

The complete API documentation is available at `http://localhost:3000/api-docs` when the server is running.




