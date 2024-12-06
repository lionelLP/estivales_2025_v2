import pool from "@/lib/db/mysql";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await pool.getConnection();
    try {
      // Récupération des images via la table de jointure
      const [rows] = await connection.execute(
        `SELECT m.* 
         FROM Media m 
         INNER JOIN Event_Media em ON m.id = em.media_id 
         WHERE em.event_id = ?
         ORDER BY m.uploaded_at DESC`,
        [params.id]
      );

      return NextResponse.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
} 