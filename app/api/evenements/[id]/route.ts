import { db } from "@/lib/db";
import pool from "@/lib/db/mysql";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM Event WHERE id = ?",
        [params.id]
      );

      interface Event {
        id: number;
        title: string;
        subtitle: string;
        description: string;
        event_date: Date;
        location: string;
        max_participants: number;
        is_public: boolean;
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
  { params }: { params: { id: string } }
) {
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
          params.id,
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
  { params }: { params: { id: string } }
) {
  try {
    // Suppression des images associées
    await db.execute("DELETE FROM event_media WHERE event_id = ?", [params.id]);

    // Suppression de l'événement
    const [result] = await db.execute("DELETE FROM events WHERE id = ?", [
      params.id,
    ]);

    return NextResponse.json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'événement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'événement" },
      { status: 500 }
    );
  }
}
