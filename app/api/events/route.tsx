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
      event_date,
      location,
      max_participants,
      is_public,
      booking_link,
      brochure_path,
    } = body;

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO Event (
          title, subtitle, description, event_date, location, 
          max_participants, is_public, booking_link, brochure_path, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          decoded.userId, // Utiliser l'ID de l'utilisateur connecté
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
            booking_link,
          });
        } catch (notifyError) {
          console.error("Failed to send notifications:", notifyError);
        }
      }

      return NextResponse.json({
        message: "Événement créé avec succès",
        eventId: result.insertId,
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
