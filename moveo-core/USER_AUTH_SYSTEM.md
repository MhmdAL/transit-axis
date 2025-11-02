# User Authentication System

This document describes the OTP-based authentication system for users in the Moveo fleet management system.

## Overview

The user authentication system uses OTP-based authentication only, providing a secure, passwordless authentication method that eliminates password management concerns.

## API Endpoints

### 1. Create User

**Endpoint:** `POST /api/auth/users`

**Description:** Creates a new user account with username and name (no password required).

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "username": "johndoe",
    "name": "John Doe",
    "type": "user"
  }
}
```

**Error Responses:**
- `400` - Name and username are required
- `409` - Username already exists

### 2. Generate OTP

**Endpoint:** `POST /api/auth/generate-otp`

**Description:** Generates an OTP for username-based authentication.

**Request Body:**
```json
{
  "username": "johndoe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP generated successfully",
  "otp": "123456"  // Only for testing - remove in production
}
```

**Error Responses:**
- `400` - Username is required
- `404` - User not found with this username

### 3. Login with OTP

**Endpoint:** `POST /api/auth/login-otp`

**Description:** Authenticates a user using username and OTP.

**Request Body:**
```json
{
  "username": "johndoe",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "username": "johndoe",
      "name": "John Doe",
      "type": "user"
    }
  }
}
```

**Error Responses:**
- `400` - Username and OTP are required
- `401` - Invalid username or OTP
- `404` - User not found

### 4. Get All Users

**Endpoint:** `GET /api/auth/users`

**Description:** Retrieves a paginated list of all users with optional search functionality.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of users per page (default: 10)
- `search` (optional): Search term for name or username

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "username": "johndoe",
      "name": "John Doe",
      "type": "user",
      "roles": ["admin"]
    },
    {
      "id": "2",
      "username": "janesmith",
      "name": "Jane Smith",
      "type": "user",
      "roles": ["user"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

**Error Responses:**
- `401` - User not authenticated

### 5. Get User Profile

**Endpoint:** `GET /api/auth/profile`

**Description:** Retrieves the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "username": "johndoe",
    "name": "John Doe",
    "type": "user",
    "roles": ["admin", "user"]
  }
}
```

**Error Responses:**
- `401` - User not authenticated
- `404` - User not found

### 6. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Description:** Refreshes an expired JWT token.

**Request Body:**
```json
{
  "token": "YOUR_JWT_TOKEN_HERE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refresh endpoint"
}
```

### 7. Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logs out the user (placeholder for token blacklisting).

**Request Body:**
```json
{
  "token": "YOUR_JWT_TOKEN_HERE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Authentication Method

### OTP-Based Authentication

- **Use Case:** Passwordless authentication, mobile apps, web applications
- **Security:** One-time password with automatic cleanup
- **Process:** Username → OTP Generation → OTP Verification → JWT Token

## Database Schema

The system uses the existing `User` and `UserAuth` tables:

```sql
model User {
  id       BigInt @id @default(autoincrement())
  name     String
  username String @unique
  password String
  roles    UserRole[]
  
  @@map("user")
}

model UserAuth {
  id         BigInt @id @default(autoincrement())
  userId     BigInt
  userType   String
  provider   String
  identifier String @unique
  password   String
  
  @@map("user_auth")
}
```

For OTP authentication:
- `provider`: "OTP"
- `userType`: "User"
- `identifier`: Username
- `password`: OTP code
- `userId`: User ID

## Security Features

1. **JWT Tokens:** Secure token-based authentication
2. **OTP Cleanup:** Automatic OTP deletion after successful login
3. **Input Validation:** Comprehensive request validation
4. **Error Handling:** Secure error messages without information leakage
5. **Passwordless:** No password storage or management required

## Testing

Use the provided `auth.http` file to test all endpoints:

```http
### Create User
POST http://localhost:3000/api/auth/users
{
  "name": "John Doe",
  "username": "johndoe"
}

### Generate OTP
POST http://localhost:3000/api/auth/generate-otp
{
  "username": "johndoe"
}

### Login with OTP
POST http://localhost:3000/api/auth/login-otp
{
  "username": "johndoe",
  "otp": "123456"
}
```

## Production Considerations

1. **OTP Delivery:** Replace console.log with SMS/email service
2. **Rate Limiting:** Implement request rate limiting
3. **Token Blacklisting:** Implement token blacklist for logout
4. **Audit Logging:** Log authentication attempts
5. **Account Lockout:** Implement account lockout after failed OTP attempts
6. **Session Management:** Implement proper session management
7. **OTP Expiration:** Implement OTP expiration timestamps

## Future Enhancements

1. **Social Login:** Google, Facebook, etc.
2. **Biometric Authentication:** Fingerprint, face recognition
3. **Single Sign-On (SSO):** Enterprise SSO integration
4. **Account Verification:** Email verification for new accounts
5. **Role-Based Access Control:** Enhanced role management
6. **Push Notifications:** OTP delivery via push notifications
7. **Backup Codes:** Generate backup codes for account recovery
