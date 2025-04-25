import pool from "@/lib/db/mysql";
import { sendEmail } from "@/lib/email";
import { createEventNotificationEmail } from "@/lib/templates/eventEmailTemplate";
import { RowDataPacket } from "mysql2/promise";

interface Event {
  title: string;
  subtitle?: string;
  description: string;
  event_date: string;
  location: string;
  booking_link?: string;
  id: number;
}

interface NewsletterSubscriber extends RowDataPacket {
  email: string;
}

export async function notifySubscribersAboutNewEvent(event: Event) {
  const connection = await pool.getConnection();

  try {
    // Get all active newsletter subscribers
    const [subscribers] = await connection.execute<NewsletterSubscriber[]>(
      "SELECT email FROM Newsletter"
    );

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return;
    }

    // Send emails to all subscribers
    const emailPromises = subscribers.map((subscriber: { email: string }) => {
      return sendEmail(
        subscriber.email,
        `Nouvel événement aux Estivales ! : ${event.title}`,
        createEventNotificationEmail(event, subscriber.email),
        true
      ).then((result) => {
        return result;
      });
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r.success).length;
    console.log(
      `Notification summary: ${successCount}/${subscribers.length} emails sent successfully`
    );
  } catch (error) {
    console.error("Error in notifySubscribersAboutNewEvent:", error);
    throw error;
  } finally {
    connection.release();
  }
}
