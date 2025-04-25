import pool from "@/lib/db/mysql";
import { MediaType, transformMediaUrls } from "@/lib/utils/media-utils";
import fs from "fs/promises";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { apiMiddleware } from "../../middleware";

interface MediaRow extends RowDataPacket {
  url: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const middlewareResponse = await apiMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  try {
    const mediaId = (await params).id;
    const body = await request.json();
    const { title, is_published } = body;

    const connection = await pool.getConnection();
    try {
      // Construire la requête SQL de mise à jour
      let sql = "UPDATE Media SET ";
      const updateParts = [];
      const values = [];

      if (title !== undefined) {
        updateParts.push("title = ?");
        values.push(title);
      }

      if (is_published !== undefined) {
        updateParts.push("is_published = ?");
        values.push(is_published ? 1 : 0);
      }

      if (updateParts.length === 0) {
        return NextResponse.json(
          { error: "Aucune donnée à mettre à jour" },
          { status: 400 }
        );
      }

      sql += updateParts.join(", ") + " WHERE id = ?";
      values.push(mediaId);

      await connection.execute(sql, values);

      // Récupérer le média mis à jour
      const [rows] = await connection.execute(
        "SELECT * FROM Media WHERE id = ?",
        [mediaId]
      );

      if ((rows as RowDataPacket[]).length === 0) {
        return NextResponse.json(
          { error: "Média non trouvé" },
          { status: 404 }
        );
      }

      return NextResponse.json((rows as RowDataPacket[])[0] as MediaRow);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du média:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du média" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const middlewareResponse = await apiMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  const mediaId = (await params).id;
  const connection = await pool.getConnection();

  try {
    // Récupérer l'URL du fichier avant la suppression
    const [mediaRows] = await connection.execute<MediaRow[]>(
      "SELECT url FROM Media WHERE id = ?",
      [mediaId]
    );
    const media = mediaRows[0];

    if (!media) {
      return NextResponse.json({ error: "Média non trouvé" }, { status: 404 });
    }

    // Supprimer d'abord les références dans Event_Media
    await connection.execute("DELETE FROM Event_Media WHERE media_id = ?", [
      mediaId,
    ]);

    // Supprimer le fichier physique s'il existe
    if (media.url) {
      // Construire le chemin correct vers le fichier dans /public/uploads/events/
      const fileName = media.url.split("/").pop(); // Récupère le nom du fichier
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "events",
        fileName || ""
      );

      try {
        const fileExists = await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false);
        if (fileExists) {
          await fs.unlink(filePath);
          console.log("Fichier supprimé avec succès:", filePath);
        } else {
          console.log("Fichier non trouvé:", filePath);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression du fichier:", error);
        // On continue même si la suppression du fichier échoue
      }
    }

    // Supprimer l'entrée de la base de données
    await connection.execute("DELETE FROM Media WHERE id = ?", [mediaId]);

    return NextResponse.json({ message: "Média supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du média:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du média" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "ID de média invalide" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      const isPublicRequest =
        request.headers.get("x-public-request") === "true";

      let query: string;

      if (isPublicRequest) {
        query = `
          SELECT id, url, title, type 
          FROM Media 
          WHERE id = ? AND is_published = 1
        `;
      } else {
        query = `
          SELECT * 
          FROM Media 
          WHERE id = ?
        `;
      }

      const [rows] = await connection.execute(query, [id]);

      if (!rows || (rows as RowDataPacket[]).length === 0) {
        return NextResponse.json(
          { error: "Média non trouvé" },
          { status: 404 }
        );
      }

      // Transformer l'URL pour utiliser l'API de fichiers dynamiques si nécessaire
      const mediaData = (rows as RowDataPacket[])[0] as MediaType;
      const transformedMediaData = transformMediaUrls([mediaData])[0];

      return NextResponse.json(transformedMediaData);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
