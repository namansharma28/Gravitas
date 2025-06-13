import nodemailer from 'nodemailer';

// Create transporter with Brevo configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // false for 587, true for 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Additional options for Brevo
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
  });
};

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Test SMTP connection
export async function testSMTPConnection() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP connection failed:', error);
    return false;
  }
}

// Send OTP email
export async function sendOTPEmail(email: string, name: string, otp: string) {
  try {
    const transporter = createTransporter();

    // Verify connection first
    await transporter.verify();

    const mailOptions = {
      from: `"Eventify" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: 'Verify your Eventify account - OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Eventify</h1>
            <p style="color: #666; margin: 5px 0;">Community Event Platform</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p style="color: #666; margin-bottom: 30px;">Hi ${name},</p>
            <p style="color: #666; margin-bottom: 30px;">
              Thank you for signing up for Eventify! Please use the verification code below to complete your registration:
            </p>
            
            <div style="background-color: #007bff; color: white; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 8px;">${otp}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            <p style="color: #666; font-size: 14px;">
              If you didn't create an account with Eventify, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              The Eventify Team
            </p>
          </div>
        </div>
      `,
      text: `
        Hi ${name},
        
        Thank you for signing up for Eventify! 
        
        Your verification code is: ${otp}
        
        This code will expire in 10 minutes.
        
        If you didn't create an account with Eventify, please ignore this email.
        
        Best regards,
        The Eventify Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Send password reset OTP
export async function sendPasswordResetOTP(email: string, name: string, otp: string) {
  try {
    const transporter = createTransporter();

    // Verify connection first
    await transporter.verify();

    const mailOptions = {
      from: `"Eventify" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your Eventify password - OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin: 0;">Eventify</h1>
            <p style="color: #666; margin: 5px 0;">Community Event Platform</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #666; margin-bottom: 30px;">Hi ${name},</p>
            <p style="color: #666; margin-bottom: 30px;">
              You requested to reset your password. Please use the code below:
            </p>
            
            <div style="background-color: #dc3545; color: white; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 8px;">${otp}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This code will expire in <strong>10 minutes</strong>.
            </p>
            <p style="color: #666; font-size: 14px;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">
              Best regards,<br>
              The Eventify Team
            </p>
          </div>
        </div>
      `,
      text: `
        Hi ${name},
        
        You requested to reset your password.
        
        Your reset code is: ${otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        The Eventify Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset OTP sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send password reset OTP:', error);
    throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}