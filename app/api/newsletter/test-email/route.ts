import { sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';
import { createEmailTemplate } from '@/lib/templates/emailTemplate';

export async function GET() {
  try {
    // Log environment variables (excluding sensitive data)
    console.log('Environment check:', {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_FROM: process.env.SMTP_FROM,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set',
      SMTP_PASSWORD: process.env.SMTP_PASSWORD ? 'set' : 'not set'
    });

    const result = await sendEmail(
      'your-email@example.com', // Replace with your email
      'Test Email Configuration',
      createEmailTemplate({
        title: 'Test Email',
        content: '<p>This is a test email to verify the newsletter configuration.</p>',
        buttonText: 'Test Button',
        buttonUrl: 'https://example.com',
        email: 'your-email@example.com',
        isNewsletter: true
      }),
      true
    );

    return NextResponse.json({
      success: true,
      result,
      config: {
        smtp_host: process.env.SMTP_HOST,
        smtp_port: process.env.SMTP_PORT,
        smtp_user: process.env.SMTP_USER,
        base_url: process.env.NEXT_PUBLIC_BASE_URL,
        jwt_secret: !!process.env.JWT_SECRET,
        smtp_password: !!process.env.SMTP_PASSWORD
      }
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
      code: error.code
    }, { 
      status: 500 
    });
  }
} 