import pool from "@/lib/db/mysql";
import { MediaType, transformMediaUrls } from "@/lib/utils/media-utils";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const connection = await pool.getConnection();
    try {
      // Récupération des images via la table de jointure
      const [rows] = await connection.execute(
        `SELECT m.* 
         FROM Media m 
         INNER JOIN Event_Media em ON m.id = em.media_id 
         WHERE em.event_id = ?
         ORDER BY m.uploaded_at DESC`,
        [resolvedParams.id]
      );

      // Transformer les URLs pour utiliser l'API de fichiers dynamiques
      const transformedRows = transformMediaUrls(rows as MediaType[]);

      return NextResponse.json(transformedRows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
