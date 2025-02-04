import pool from "@/lib/db/mysql";
import { writeFile } from "fs/promises";
import { ResultSetHeader } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { convertToWebP } from "@/lib/imageTransformer";
import { apiMiddleware } from "../../middleware";

export async function POST(request: NextRequest) {
  const middlewareResponse = await apiMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const eventId = formData.get("eventId");

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    const uploadedFiles = [];

    try {
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}.webp`;
        const filepath = path.join(
          process.cwd(),
          "public",
          "uploads",
          "events",
          filename
        );
        const relativePath = `/uploads/events/${filename}`;

        // Convert the image to WebP
        const webpBuffer = await convertToWebP(buffer);

        await writeFile(filepath, webpBuffer);

        // Insérer dans la table Media
        const [mediaResult] = await connection.execute(
          `INSERT INTO Media (url, type, title, size) VALUES (?, ?, ?, ?)`,
          [relativePath, file.type, file.name, file.size]
        );

        const mediaId = (mediaResult as ResultSetHeader).insertId;

        // Créer la relation dans Event_Media
        if (eventId) {
          await connection.execute(
            `INSERT INTO Event_Media (event_id, media_id) VALUES (?, ?)`,
            [eventId, mediaId]
          );
        }

        uploadedFiles.push({
          id: mediaId,
          url: relativePath,
          name: file.name,
        });
      }

      return NextResponse.json({ files: uploadedFiles });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
