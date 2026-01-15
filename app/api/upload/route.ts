import pool from "@/lib/db/mysql";
import { getMediaUrl } from "@/lib/utils/media-utils";
import { access, mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const image = formData.get("image") as File;
    const video = formData.get("video") as File;
    const useDynamicUrl = formData.get("useDynamicUrl") === "true";
    // Récupérer l'ID de l'événement si fourni
    const eventId = formData.get("eventId")
      ? String(formData.get("eventId"))
      : null;
    // Récupérer le titre si fourni
    const title = formData.get("title") ? String(formData.get("title")) : null;

    if (!file && !image && !video) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = Date.now() + "-" + file.name.replaceAll(" ", "_");
      const uploadDir = path.join(process.cwd(), "public/uploads/brochures");
      // Ensure the directory exists
      try {
        await access(uploadDir);
      } catch {
        await mkdir(uploadDir, { recursive: true });
      }
      await writeFile(path.join(uploadDir, filename), buffer);

      const staticPath = `/uploads/brochures/${filename}`;
      const dynamicPath = useDynamicUrl ? getMediaUrl(staticPath) : staticPath;

      // Pour les brochures, nous n'enregistrons pas dans Media car elles sont directement liées à l'événement
      // dans le champ brochure_path. Nous retournons simplement le chemin.

      return NextResponse.json({
        path: dynamicPath,
      });
    }

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = Date.now() + "-" + image.name.replaceAll(" ", "_");
      const uploadDir = path.join(process.cwd(), "public/uploads/images");
      // Ensure the directory exists
      try {
        await access(uploadDir);
      } catch {
        await mkdir(uploadDir, { recursive: true });
      }
      await writeFile(path.join(uploadDir, filename), buffer);

      const staticPath = `/uploads/images/${filename}`;
      const dynamicPath = useDynamicUrl ? getMediaUrl(staticPath) : staticPath;

      // Enregistrer l'image en base de données si eventId est spécifié
      if (eventId) {
        try {
          const connection = await pool.getConnection();
          try {
            // Insérer dans la table Media
            const [result] = await connection.execute(
              "INSERT INTO Media (title, url, type, is_published) VALUES (?, ?, ?, ?)",
              [title || image.name, staticPath, "image/webp", 1]
            );

            const mediaId = (result as { insertId: number }).insertId;

            // Créer la relation Event_Media
            await connection.execute(
              "INSERT INTO Event_Media (event_id, media_id) VALUES (?, ?)",
              [eventId, mediaId]
            );

            return NextResponse.json({
              url: dynamicPath,
              mediaId: mediaId,
              eventId: eventId,
            });
          } finally {
            connection.release();
          }
        } catch (dbError) {
          console.error("Erreur base de données:", dbError);
          // On retourne quand même le chemin du fichier même si l'enregistrement en BDD échoue
        }
      }

      return NextResponse.json({
        url: dynamicPath,
      });
    }

    if (video) {
      const buffer = Buffer.from(await video.arrayBuffer());
      // Nettoyer le nom de fichier
      const originalName = path.parse(video.name).name;
      const extension = path.parse(video.name).ext;
      const sanitizedOriginalName = originalName.replace(/[^a-zA-Z0-9-_]/g, "_");

      const filename = `${Date.now()}_${sanitizedOriginalName}${extension}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/videos");

      // Ensure the directory exists
      try {
        await access(uploadDir);
      } catch {
        await mkdir(uploadDir, { recursive: true });
      }
      await writeFile(path.join(uploadDir, filename), buffer);

      const staticPath = `/uploads/videos/${filename}`;

      // Enregistrer la vidéo en base de données
      try {
        const connection = await pool.getConnection();
        try {
          // Vérifier les colonnes disponibles
          const [tableInfo] = await connection.execute("DESCRIBE Media");
          const columns = (tableInfo as { Field: string }[]).map((col) => col.Field);

          let query = "INSERT INTO Media (title, url, type";
          const values: (string | number)[] = [title || video.name, staticPath, video.type || "video/mp4"];
          const placeholders = ["?", "?", "?"];

          if (columns.includes("size")) {
            query += ", size";
            values.push(buffer.length);
            placeholders.push("?");
          }

          if (columns.includes("is_published")) {
            query += ", is_published";
            values.push(1);
            placeholders.push("?");
          }

          query += `) VALUES (${placeholders.join(", ")})`;

          // Insérer dans la table Media
          const [result] = await connection.execute(query, values);

          const mediaId = (result as { insertId: number }).insertId;

          // Créer la relation Event_Media si eventId est spécifié
          if (eventId) {
            await connection.execute(
              "INSERT INTO Event_Media (event_id, media_id) VALUES (?, ?)",
              [eventId, mediaId]
            );
          }

          return NextResponse.json({
            files: [{
              id: mediaId,
              url: staticPath,
              name: video.name
            }],
            url: staticPath,
          });
        } finally {
          connection.release();
        }
      } catch (dbError) {
        console.error("Erreur base de données:", dbError);
        return NextResponse.json(
          {
            error: "Erreur base de données lors de l'enregistrement de la vidéo",
            details: dbError instanceof Error ? dbError.message : String(dbError)
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Erreur upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
