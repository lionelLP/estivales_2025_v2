import { sendEmail } from '@/lib/email';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await sendEmail(
      'your-test-recipient@example.com', // Replace with your test email
      'Test Newsletter',
      '<h1>Test Email</h1><p>This is a test email from your newsletter system.</p>'
    );

    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { 
      status: 500 
    });
  }
} 