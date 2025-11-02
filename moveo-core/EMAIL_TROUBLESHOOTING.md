# Email Sending Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. **Missing Email Configuration (MOST COMMON)**
**Problem**: No SMTP settings in `.env` file
**Solution**: Add email configuration to `.env`:

```env
# Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:3001
```

### 2. **Gmail App Password Issues**
**Problem**: Using regular Gmail password instead of app password
**Solution**: 
1. Enable 2-factor authentication on Gmail
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASS`

### 3. **Empty Email Credentials**
**Problem**: `SMTP_USER` or `SMTP_PASS` is empty
**Solution**: Check your `.env` file has actual values:
```bash
# Check current values
echo "SMTP_USER: $SMTP_USER"
echo "SMTP_PASS: $SMTP_PASS"
```

### 4. **Network/Firewall Issues**
**Problem**: Cannot connect to SMTP server
**Solution**: Test SMTP connection:
```bash
# Test Gmail SMTP connection
telnet smtp.gmail.com 587
```

### 5. **Email Service Provider Issues**
**Problem**: SMTP server is down or blocking requests
**Solution**: Try alternative email services:

#### **Mailtrap (Testing)**
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-username
SMTP_PASS=your-mailtrap-password
```

#### **SendGrid**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## 🔧 **Testing Steps**

### Step 1: Verify Environment Variables
```bash
cd moveo-core
node -e "require('dotenv').config(); console.log('SMTP_USER:', process.env.SMTP_USER); console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');"
```

### Step 2: Test Email Service Directly
Create a test file `test-email.js`:
```javascript
require('dotenv').config();
const emailService = require('./src/services/emailService').default;

async function testEmail() {
  try {
    const result = await emailService.sendActivationEmail(
      'test@example.com',
      'test-code-123',
      'Test User'
    );
    console.log('Email sent:', result);
  } catch (error) {
    console.error('Email error:', error.message);
  }
}

testEmail();
```

Run it:
```bash
node test-email.js
```

### Step 3: Check Server Logs
Look for detailed error messages in your server console when creating a user.

## 🚀 **Quick Fix for Development**

If you just want to test the flow without real emails, you can modify the email service to log instead of sending:

```javascript
// In emailService.ts, temporarily replace sendMail with:
console.log('=== EMAIL WOULD BE SENT ===');
console.log('To:', options.to);
console.log('Subject:', options.subject);
console.log('Activation Link:', `${process.env.FRONTEND_URL}/activate?code=${activationCode}`);
console.log('========================');
return true; // Return success for testing
```

## 📋 **Checklist**

- [ ] `.env` file has SMTP configuration
- [ ] `SMTP_USER` is a valid email address
- [ ] `SMTP_PASS` is an app password (for Gmail)
- [ ] `FRONTEND_URL` is set correctly
- [ ] Server can reach SMTP host (port 587)
- [ ] No firewall blocking SMTP connections
- [ ] Email service is not rate-limited

## 🔍 **Debug Mode**

Add this to your email service for detailed debugging:

```javascript
// Add before sendMail call
console.log('Email config:', {
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  user: emailConfig.auth.user,
  pass: emailConfig.auth.pass ? 'SET' : 'NOT SET'
});
```



