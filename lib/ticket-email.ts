import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

// Create transporter with Brevo configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
  });
};

interface TicketEmailData {
  recipientName: string;
  recipientEmail: string;
  eventDetails: {
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
  };
  emailSubject: string;
  emailMessage: string;
  includeQR: boolean;
  participantId: string;
}

export async function sendTicketEmail(data: TicketEmailData) {
  try {
    const transporter = createTransporter();

    // Verify connection first
    await transporter.verify();

    let qrCodeAttachment = null;

    if (data.includeQR) {
      // Generate QR code data
      const qrData = JSON.stringify({
        participantId: data.participantId,
        name: data.recipientName,
        email: data.recipientEmail,
        event: data.eventDetails.title,
        date: data.eventDetails.date,
        time: data.eventDetails.time,
        checkInCode: `${data.participantId}-${Date.now()}`,
      });

      // Generate QR code as base64
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Convert data URL to buffer for attachment
      const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

      qrCodeAttachment = {
        filename: 'event-ticket-qr.png',
        content: qrCodeBuffer,
        contentType: 'image/png',
        cid: 'qrcode',
      };
    }

    const mailOptions = {
      from: `"Eventify" <${process.env.SENDER_EMAIL}>`,
      to: data.recipientEmail,
      subject: data.emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎫 Event Ticket</h1>
            <p style="color: white; margin: 5px 0; opacity: 0.9;">Eventify</p>
          </div>
          
          <!-- Ticket Content -->
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 5px solid #667eea;">
            <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.recipientName},</h2>
            
            <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 8px; border: 2px dashed #667eea;">
              ${data.emailMessage.replace(/\n/g, '<br>')}
            </div>
            
            <!-- Event Details Card -->
            <div style="background: white; padding: 25px; border-radius: 10px; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin-bottom: 20px; font-size: 20px;">📅 Event Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold; width: 100px;">Event:</td>
                  <td style="padding: 8px 0; color: #333;">${data.eventDetails.title}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0; color: #333;">${data.eventDetails.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Time:</td>
                  <td style="padding: 8px 0; color: #333;">${data.eventDetails.time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Location:</td>
                  <td style="padding: 8px 0; color: #333;">${data.eventDetails.location}</td>
                </tr>
              </table>
            </div>
            
            ${data.includeQR ? `
            <!-- QR Code Section -->
            <div style="background: white; padding: 25px; border-radius: 10px; text-align: center; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #667eea; margin-bottom: 15px;">🔍 Check-in QR Code</h3>
              <img src="cid:qrcode" alt="QR Code for Check-in" style="max-width: 200px; border: 2px solid #667eea; border-radius: 10px; padding: 10px; background: white;">
              <p style="color: #666; font-size: 14px; margin-top: 15px;">
                Show this QR code to volunteers at the event for quick check-in
              </p>
            </div>
            ` : ''}
            
            <!-- Important Notes -->
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3; margin: 25px 0;">
              <h4 style="color: #1976d2; margin-bottom: 10px;">📋 Important Notes:</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px;">
                <li>Please arrive 15 minutes before the event starts</li>
                <li>Keep this email as your confirmation</li>
                ${data.includeQR ? '<li>Present the QR code above for check-in</li>' : ''}
                <li>Contact us if you have any questions</li>
              </ul>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px;">
              This ticket was generated by Eventify<br>
              If you have any questions, please contact the event organizers
            </p>
          </div>
        </div>
      `,
      text: `
        Hi ${data.recipientName},
        
        ${data.emailMessage}
        
        Event Details:
        Event: ${data.eventDetails.title}
        Date: ${data.eventDetails.date}
        Time: ${data.eventDetails.time}
        Location: ${data.eventDetails.location}
        
        ${data.includeQR ? 'Your QR code is attached for check-in at the venue.' : ''}
        
        Please keep this email as your confirmation.
        
        Best regards,
        The Eventify Team
      `,
      attachments: data.includeQR && qrCodeAttachment ? [qrCodeAttachment] : [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Ticket email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send ticket email:', error);
    throw new Error(`Failed to send ticket email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}