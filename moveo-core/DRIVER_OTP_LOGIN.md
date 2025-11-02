# Driver OTP Login System

This document describes the OTP-based authentication system for drivers in the Moveo fleet management system.

## Overview

The OTP login system allows drivers to authenticate using their phone number and a one-time password (OTP) sent via SMS. This provides a secure, passwordless authentication method.

## API Endpoints

### 1. Generate OTP

**Endpoint:** `POST /api/drivers/generate-otp`

**Description:** Generates and sends an OTP to the driver's phone number.

**Request Body:**
```json
{
  "phone": "1234567890"
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
- `400` - Phone number is required
- `404` - Driver not found with this phone number

### 2. Login with OTP

**Endpoint:** `POST /api/drivers/login-otp`

**Description:** Authenticates a driver using phone number and OTP.

**Request Body:**
```json
{
  "phone": "1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "driver": {
      "id": "1",
      "name": "John Doe",
      "phone": "1234567890",
      "email": "john.doe@example.com",
      "qid": "123456789031",
      "type": "driver"
    }
  }
}
```

**Error Responses:**
- `400` - Phone number and OTP are required
- `401` - Invalid phone number or OTP
- `404` - Driver not found

## How It Works

1. **OTP Generation:**
   - Driver requests OTP by providing phone number
   - System checks if driver exists with that phone number
   - Generates a 6-digit random OTP
   - Stores OTP in `UserAuth` table with provider 'OTP'
   - Sends OTP via SMS (in production)

2. **OTP Verification:**
   - Driver provides phone number and OTP
   - System validates OTP against stored value
   - If valid, generates JWT token
   - Deletes OTP from database (one-time use)
   - Returns token and driver information

## Database Schema

The system uses the existing `UserAuth` table:

```sql
model UserAuth {
  id         BigInt @id @default(autoincrement())
  userId     BigInt
  provider   String
  identifier String
  password   String
  user       User   @relation(fields: [userId], references: [id])
  
  @@map("user_auth")
}
```

For OTP authentication:
- `provider`: "OTP"
- `identifier`: Phone number
- `password`: OTP code
- `userId`: Driver ID

## Security Considerations

1. **OTP Expiration:** OTPs should expire after a short time (e.g., 5 minutes)
2. **Rate Limiting:** Implement rate limiting to prevent OTP spam
3. **SMS Integration:** Use a reliable SMS service provider
4. **OTP Cleanup:** OTPs are automatically deleted after successful login
5. **JWT Security:** Use secure JWT secrets and appropriate expiration times

## Testing

Use the provided `.http` files in the `tests/` directory to test the OTP endpoints:

```http
### Generate OTP for Driver Login
POST http://localhost:3000/api/drivers/generate-otp
Content-Type: application/json

{
  "phone": "1234567890"
}

### Login with OTP
POST http://localhost:3000/api/drivers/login-otp
Content-Type: application/json

{
  "phone": "1234567890",
  "otp": "123456"
}
```

## Future Enhancements

1. **SMS Integration:** Replace console.log with actual SMS service
2. **OTP Expiration:** Add timestamp-based expiration
3. **Rate Limiting:** Implement request rate limiting
4. **Audit Logging:** Log authentication attempts
5. **Multi-language Support:** Support multiple languages for SMS
6. **Fallback Methods:** Alternative authentication methods if SMS fails
