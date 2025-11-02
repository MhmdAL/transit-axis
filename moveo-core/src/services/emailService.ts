import nodemailer from 'nodemailer';
import { config } from '../config/config';

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = transporter;
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Moveo Fleet Management" <${emailConfig.auth.user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      console.log('sending email');
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  public async sendActivationEmail(email: string, activationCode: string, userName: string): Promise<boolean> {
    const activationLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/activate?code=${activationCode}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Activation - Moveo Fleet Management</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f8fafc; }
            .button { 
              display: inline-block; 
              background-color: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Moveo Fleet Management</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>Thank you for joining Moveo Fleet Management System. To complete your account setup, please click the button below to activate your account and set your password.</p>
              
              <div style="text-align: center;">
                <a href="${activationLink}" class="button">Activate Account</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #e2e8f0; padding: 10px; border-radius: 4px;">
                ${activationLink}
              </p>
              
              <p><strong>Important:</strong> This activation link will expire in 24 hours for security reasons.</p>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 Moveo Fleet Management System</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Activate Your Moveo Fleet Management Account',
      html: html
    });
  }

  public async sendPasswordResetEmail(email: string, resetCode: string, userName: string): Promise<boolean> {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?code=${resetCode}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Moveo Fleet Management</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background-color: #f8fafc; }
            .button { 
              display: inline-block; 
              background-color: #dc2626; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName}!</h2>
              <p>We received a request to reset your password for your Moveo Fleet Management account.</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #e2e8f0; padding: 10px; border-radius: 4px;">
                ${resetLink}
              </p>
              
              <p><strong>Important:</strong> This reset link will expire in 1 hour for security reasons.</p>
              
              <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>© 2024 Moveo Fleet Management System</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Password Reset - Moveo Fleet Management',
      html: html
    });
  }
}

export default EmailService.getInstance();
