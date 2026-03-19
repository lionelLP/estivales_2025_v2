import { MediaType, transformMediaUrls } from "@/lib/utils/media-utils";
import { apiMiddleware } from "@/app/api/middleware";
import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { notifySubscribersAboutNewEvent } from "@/lib/notifications/eventNotifications";
import { ResultSetHeader } from "mysql2";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const middlewareResponse = await apiMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  const token = request.cookies.get("token");
  if (!token) {
    return NextResponse.json(
      { error: "Non autorisé - Token manquant" },
      { status: 401 }
    );
  }

  try {
    const decoded = await verifyToken(token.value);

    if (!decoded || decoded.userType !== 0) {
      return NextResponse.json(
        { error: "Non autorisé - Accès administrateur requis" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      event_dates,
      location,
      max_participants,
      is_public,
      booking_link,
      brochure_path,
      instructions,
    } = body;

    // Validation : au moins une date
    if (!event_dates || event_dates.length === 0) {
      return NextResponse.json(
        { error: "Au moins une date est requise" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Insérer l'événement d'abord (sans event_date temporairement)
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO Event (
          title, subtitle, description, event_date, location, 
          max_participants, is_public, booking_link, brochure_path, instructions, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          subtitle,
          description,
          event_dates[0], // Utiliser la première date pour event_date
          location,
          max_participants,
          is_public,
          booking_link,
          brochure_path,
          instructions,
          decoded.userId,
        ]
      );

      const eventId = result.insertId;

      // Insérer toutes les dates dans Event_Date
      for (const dateTime of event_dates) {
        await connection.execute(
          `INSERT INTO Event_Date (event_id, date_time) VALUES (?, ?)`,
          [eventId, dateTime]
        );
      }

      // If event is public, send notifications immediately
      if (is_public) {
        try {
          await notifySubscribersAboutNewEvent({
            id: eventId,
            title,
            subtitle,
            description,
            event_date: event_dates[0],
            location,
            booking_link,
          });
        } catch (notifyError) {
          console.error("Failed to send notifications:", notifyError);
        }
      }

      return NextResponse.json({
        message: "Événement créé avec succès",
        eventId: eventId,
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
        `SELECT 
          e.*,
          COALESCE(
            (SELECT MIN(ed.date_time) FROM Event_Date ed WHERE ed.event_id = e.id),
            e.event_date
          ) as first_date,
          COALESCE(
            (SELECT MAX(ed.date_time) FROM Event_Date ed WHERE ed.event_id = e.id),
            e.event_date
          ) as last_date,
          (SELECT JSON_ARRAYAGG(
            JSON_OBJECT('id', ed.id, 'date_time', ed.date_time)
          ) FROM Event_Date ed WHERE ed.event_id = e.id) as event_dates
        FROM Event e
        ORDER BY first_date DESC`
      );

      const events = rows as any[];

      if (events.length > 0) {
        // Fetch images for these events
        const eventIds = events.map((e) => e.id);
        const placeholders = eventIds.map(() => "?").join(",");

        const [mediaRows] = await connection.execute(
          `SELECT em.event_id, m.* 
           FROM Media m 
           JOIN Event_Media em ON m.id = em.media_id 
           WHERE em.event_id IN (${placeholders})`,
          eventIds
        );

        const mediaList = mediaRows as (MediaType & { event_id: number })[];
        const transformedMedia = transformMediaUrls(mediaList);

        events.forEach((event) => {
          event.images = transformedMedia.filter(
            (m) => m.event_id === event.id
          );
        });
      }

      return NextResponse.json(events);
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
