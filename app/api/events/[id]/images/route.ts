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


export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { mediaIds } = await request.json();

    if (!mediaIds || !Array.isArray(mediaIds)) {
      return NextResponse.json(
        { error: "mediaIds doit être un tableau" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      // Pour chaque ID de média, vérifier s'il est déjà lié, sinon le lier
      for (const mediaId of mediaIds) {
        const [existing] = await connection.execute(
          "SELECT 1 FROM Event_Media WHERE event_id = ? AND media_id = ?",
          [resolvedParams.id, mediaId]
        );

        if ((existing as any[]).length === 0) {
          await connection.execute(
            "INSERT INTO Event_Media (event_id, media_id) VALUES (?, ?)",
            [resolvedParams.id, mediaId]
          );
        }
      }

      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de la liaison des médias:", error);
    return NextResponse.json(
      { error: "Erreur lors de la liaison des médias" },
      { status: 500 }
    );
  }
}
