import pool from "@/lib/db/mysql";
import { writeFile } from "fs/promises";
import { ResultSetHeader } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { convertToWebP, isImage } from "@/lib/imageTransformer";
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
        if (!isImage(file.name)) {
          throw new Error(`Invalid image format for file: ${file.name}`);
        }
        const originalName = path.parse(file.name).name;
        const sanitizedOriginalName = originalName.replace(/[^a-zA-Z0-9-_]/g, "_");
        const filename = `${Date.now()}_${sanitizedOriginalName}.webp`;
        const filepath = path.join(
          process.cwd(),
          "public",
          "uploads",
          "events",
          filename
        );
        const relativePath = `/uploads/events/${filename}`;

        // Convert the image to WebP
        try {
          console.log('Starting WebP conversion for file:', file.name);
          const webpBuffer = await convertToWebP(buffer);
          console.log('WebP conversion successful. Buffer size:', webpBuffer.length);
        } catch (convError) {
          console.error('Conversion failed for', file.name, convError);
          throw new Error(`Failed to convert ${file.name} to WebP`);
        }
        const webpBuffer = await convertToWebP(buffer);
        await writeFile(filepath, webpBuffer);

        // Insert into the Media table
        const [mediaResult] = await connection.execute(
          `INSERT INTO Media (url, type, title, size) VALUES (?, ?, ?, ?)`,
          [relativePath, 'image/webp', file.name, webpBuffer.length]
        );
        const mediaId = (mediaResult as ResultSetHeader).insertId;

        // Create the relationship in Event_Media
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
