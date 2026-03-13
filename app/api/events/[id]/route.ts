import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface EventRow extends RowDataPacket {
  user_id: number;
}

// Middleware de vérification d'authentification
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return null;
  }

  return await verifyToken(token.value);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT id, title, subtitle, description, event_date, created_at, 
          location, max_participants, is_public, user_id, brochure_path, booking_link, instructions 
         FROM Event WHERE id = ?`,
        [resolvedParams.id]
      );

      interface Event {
        id: number;
        title: string;
        subtitle: string | null;
        description: string | null;
        event_date: Date;
        created_at: Date;
        location: string | null;
        max_participants: number | null;
        is_public: number;
        user_id: number;
        brochure_path: string | null;
        booking_link: string | null;
        instructions: string | null;
      }

      const events = rows as Event[];
      if (events.length === 0) {
        return NextResponse.json(
          { error: "Événement non trouvé" },
          { status: 404 }
        );
      }

      return NextResponse.json(events[0]);
    } catch (error) {
      console.error("Erreur SQL:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération de l'événement" },
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Vérification de l'authentification
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Vérification des permissions (ADMIN ou propriétaire de l'événement)
  if (user.userType !== 0) {
    const resolvedParams = await params;
    const connection = await pool.getConnection();
    const [event] = await connection.execute<EventRow[]>(
      "SELECT user_id FROM Event WHERE id = ?",
      [resolvedParams.id]
    );
    connection.release();

    if (!event || event[0]?.user_id !== user.userId) {
      return NextResponse.json(
        { error: "Permission refusée" },
        { status: 403 }
      );
    }
  }

  try {
    const resolvedParams = await params;
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

    const connection = await pool.getConnection();
    try {
      const firstDate = event_dates && event_dates.length > 0 ? event_dates[0] : null;

      await connection.execute(
        `UPDATE Event SET 
          title = ?, 
          subtitle = ?, 
          description = ?, 
          event_date = ?, 
          location = ?, 
          max_participants = ?, 
          is_public = ?,
          booking_link = ?,
          brochure_path = ?,
          instructions = ?
        WHERE id = ?`,
        [
          title,
          subtitle,
          description,
          firstDate,
          location,
          max_participants,
          is_public,
          booking_link,
          brochure_path,
          instructions,
          resolvedParams.id,
        ]
      );

      // Mettre à jour les dates dans Event_Date
      if (event_dates && event_dates.length > 0) {
        // Supprimer les anciennes dates
        await connection.execute(
          "DELETE FROM Event_Date WHERE event_id = ?",
          [resolvedParams.id]
        );

        // Insérer les nouvelles dates
        for (const dateTime of event_dates) {
          await connection.execute(
            "INSERT INTO Event_Date (event_id, date_time) VALUES (?, ?)",
            [resolvedParams.id, dateTime]
          );
        }
      }

      return NextResponse.json({
        message: "Événement mis à jour avec succès",
      });
    } catch (error: unknown) {
      console.error("Erreur SQL:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Erreur lors de la mise à jour",
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Vérification de l'authentification
  const user = await checkAuth();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Seuls les ADMIN peuvent supprimer des événements
  if (user.userType !== 0) {
    return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    // Suppression des images associées
    await pool.execute("DELETE FROM Event_Media WHERE event_id = ?", [
      resolvedParams.id,
    ]);

    // Suppression de l'événement
    await pool.execute("DELETE FROM Event WHERE id = ?", [resolvedParams.id]);

    return NextResponse.json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'événement" },
      { status: 500 }
    );
  }
}
