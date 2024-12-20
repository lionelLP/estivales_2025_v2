import pool from "@/lib/db/mysql";
import { NextResponse } from "next/server";
import { notifySubscribersAboutNewEvent } from '@/lib/notifications/eventNotifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      subtitle,
      description,
      event_date,
      location,
      max_participants,
      is_public,
      booking_link,
      brochure_path,
    } = body;

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        `INSERT INTO Event (
          title, subtitle, description, event_date, location, 
          max_participants, is_public, booking_link, brochure_path, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          title,
          subtitle,
          description,
          event_date,
          location,
          max_participants,
          is_public,
          booking_link,
          brochure_path,
        ]
      );

      // If event is public, send notifications immediately
      if (is_public) {
        try {
          await notifySubscribersAboutNewEvent({
            id: result.insertId,
            title,
            subtitle,
            description,
            event_date,
            location,
            booking_link
          });
          console.log('Notifications sent successfully for event:', title);
        } catch (notifyError) {
          console.error('Failed to send notifications:', notifyError);
        }
      }

      return NextResponse.json({
        message: "Événement créé avec succès",
        result,
      });
    } catch (error: unknown) {
      console.error("Erreur SQL:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error && "sqlMessage" in error
              ? error.sqlMessage
              : "Erreur lors de la création de l'événement",
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        "SELECT * FROM Event ORDER BY event_date DESC"
      );

      return NextResponse.json(rows);
    } catch (error) {
      console.error("Erreur SQL:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des événements" },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
