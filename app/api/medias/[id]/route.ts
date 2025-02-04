import pool from "@/lib/db/mysql";
import fs from "fs/promises";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { apiMiddleware } from "../../middleware";

interface MediaRow extends RowDataPacket {
  url: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const middlewareResponse = await apiMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  const mediaId = params.id;
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
