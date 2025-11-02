require('dotenv').config();
const emailService = require('./src/services/emailService').default;

async function testEmailService() {
  console.log('🔍 Testing Email Service Configuration...\n');
  
  // Check environment variables
  console.log('📧 Email Configuration:');
  console.log('SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
  console.log('SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
  console.log('SMTP_SECURE:', process.env.SMTP_SECURE || 'NOT SET');
  console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET (hidden)' : 'NOT SET');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
  console.log('');

  // Test email sending
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('❌ Email configuration incomplete!');
    console.log('Please set SMTP_USER and SMTP_PASS in your .env file');
    return;
  }

  console.log('📤 Testing email sending...');
  try {
    const result = await emailService.sendActivationEmail(
      'test@example.com',
      'test-activation-code-123',
      'Test User'
    );
    
    if (result) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email sending failed');
    }
  } catch (error) {
    console.log('❌ Email error:', error.message);
    console.log('Full error:', error);
  }
}

testEmailService();




