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
      from: `"Gravitas" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: 'Verify your Gravitas account - OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px;">
            <h1 style="color: #333; margin: 0;">Gravitas</h1>
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #333;">Email Verification</h2>
            <p style="color: #666; line-height: 1.6;">
              Thank you for signing up for Gravitas! Please use the verification code below to complete your registration:
            </p>
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h1 style="color: #333; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="color: #666; line-height: 1.6;">
              This code will expire in 10 minutes.
            </p>
            <p style="color: #666; line-height: 1.6;">
              If you didn't create an account with Gravitas, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              The Gravitas Team
            </p>
          </div>
        </div>
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
      from: `"Gravitas" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your Gravitas password - OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px;">
            <h1 style="color: #333; margin: 0;">Gravitas</h1>
          </div>
          <div style="padding: 20px;">
            <h2 style="color: #333;">Password Reset</h2>
            <p style="color: #666; line-height: 1.6;">
              You requested to reset your password. Please use the code below to reset your password:
            </p>
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h1 style="color: #333; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="color: #666; line-height: 1.6;">
              This code will expire in 10 minutes.
            </p>
            <p style="color: #666; line-height: 1.6;">
              If you didn't request a password reset, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              The Gravitas Team
            </p>
          </div>
        </div>
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

export async function sendWelcomeEmail(email: string, name: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Gravitas" <${process.env.SENDER_EMAIL}>`,
    to: email,
    subject: 'Welcome to Gravitas!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px;">
          <h1 style="color: #333; margin: 0;">Gravitas</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #333;">Welcome to Gravitas!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for signing up for Gravitas!
          </p>
          <p style="color: #666; line-height: 1.6;">
            If you didn't create an account with Gravitas, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">
            The Gravitas Team
          </p>
        </div>
      </div>
    `,
  };

  // ... rest of the code ...
}

export async function sendPasswordResetEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Gravitas" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your Gravitas password - OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px;">
          <h1 style="color: #333; margin: 0;">Gravitas</h1>
        </div>
        <div style="padding: 20px;">
          <h2 style="color: #333;">Password Reset</h2>
          <p style="color: #666; line-height: 1.6;">
            You requested to reset your password. Please use the code below to reset your password:
          </p>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h1 style="color: #333; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666; line-height: 1.6;">
            This code will expire in 10 minutes.
          </p>
          <p style="color: #666; line-height: 1.6;">
            If you didn't request a password reset, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">
            The Gravitas Team
          </p>
        </div>
      </div>
    `,
  };

  // ... rest of the code ...
}