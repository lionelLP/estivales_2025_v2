import pool from '@/lib/db/mysql';
import { sendEmail } from '@/lib/email';
import { createEventNotificationEmail } from '@/lib/templates/eventEmailTemplate';

export async function notifySubscribersAboutNewEvent(event: any) {
  console.log('Starting notification process for event:', event.title);
  const connection = await pool.getConnection();
  
  try {
    // Get all active newsletter subscribers
    const [subscribers] = await connection.execute(
      'SELECT email FROM Newsletter'
    );
    console.log(`Found ${Array.isArray(subscribers) ? subscribers.length : 0} active subscribers`);

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      console.log('No active subscribers found, skipping notifications');
      return;
    }

    // Send emails to all subscribers
    const emailPromises = subscribers.map((subscriber: { email: string }) => {
      console.log(`Sending notification to: ${subscriber.email}`);
      return sendEmail(
        subscriber.email,
        `Nouvel événement : ${event.title}`,
        createEventNotificationEmail(event, subscriber.email),
        true
      ).then(result => {
        console.log(`Email result for ${subscriber.email}:`, result);
        return result;
      });
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;
    console.log(`Notification summary: ${successCount}/${subscribers.length} emails sent successfully`);
    
  } catch (error) {
    console.error('Error in notifySubscribersAboutNewEvent:', error);
    throw error;
  } finally {
    connection.release();
  }
} 