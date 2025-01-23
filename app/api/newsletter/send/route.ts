import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { sendEmail } from '@/lib/email';
import { createEmailTemplate } from '@/lib/templates/emailTemplate';

export async function POST(request: Request) {
  const connection = await pool.getConnection();
  
  try {
    const { subject, content } = await request.json();

    // Get all newsletter subscribers
    const [subscribers] = await connection.execute(
      'SELECT email FROM Newsletter'
    );

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json({ 
        error: 'Aucun abonné trouvé' 
      }, { 
        status: 404 
      });
    }

    // Send email to all subscribers
    const emailPromises = subscribers.map((subscriber: { email: string }) => {
      return sendEmail(
        subscriber.email,
        subject,
        createEmailTemplate({
          title: subject,
          content: content,
          email: subscriber.email,
          isNewsletter: true
        }),
        true
      );
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      totalSubscribers: subscribers.length
    });

  } catch (error) {
    console.error('Newsletter sending error:', error);
    return NextResponse.json({ 
      error: 'Erreur l\'envoi de la newsletter' 
    }, { 
      status: 500 
    });
  } finally {
    connection.release();
  }
} 