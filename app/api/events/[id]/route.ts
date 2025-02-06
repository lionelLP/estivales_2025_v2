import pool from "@/lib/db/mysql";
import { NextResponse } from "next/server";

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
         location, max_participants, is_public, user_id, brochure_path, booking_link 
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
  try {
    const resolvedParams = await params;
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
        `UPDATE Event SET 
          title = ?, 
          subtitle = ?, 
          description = ?, 
          event_date = ?, 
          location = ?, 
          max_participants = ?, 
          is_public = ?,
          booking_link = ?,
          brochure_path = ?
        WHERE id = ?`,
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
          resolvedParams.id,
        ]
      );

      return NextResponse.json({
        message: "Événement mis à jour avec succès",
        result,
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
