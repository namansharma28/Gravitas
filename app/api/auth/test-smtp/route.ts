import { NextResponse } from 'next/server';
import { testSMTPConnection } from '@/lib/email';

export async function GET() {
  try {
    const isConnected = await testSMTPConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'SMTP connection successful',
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '***' : 'Not set',
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'SMTP connection failed',
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '***' : 'Not set',
        }
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'SMTP test failed',
      error: error.message,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '***' : 'Not set',
      }
    }, { status: 500 });
  }
}