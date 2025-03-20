import pool from "@/lib/db/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  console.log("Requête API media reçue", {
    isPublic: request.headers.get("x-public-request") === "true",
  });

  try {
    const connection = await pool.getConnection();
    try {
      const isPublicRequest =
        request.headers.get("x-public-request") === "true";

      // Vérifier la structure de la table Media pour déterminer les champs disponibles
      console.log("Vérification de la structure de la table Media");
      const [tableInfo] = await connection.execute("DESCRIBE Media");
      const columns = (tableInfo as { Field: string }[]).map(
        (col) => col.Field
      );
      console.log("Colonnes disponibles:", columns);

      let query;

      // Pour les requêtes publiques, nous ne retournons que les médias publiés si la colonne existe
      if (isPublicRequest && columns.includes("is_published")) {
        query =
          "SELECT id, url, title, type FROM Media WHERE is_published = 1 ORDER BY uploaded_at DESC";
      } else if (isPublicRequest) {
        // Si on n'a pas de colonne is_published, on retourne tous les médias pour les requêtes publiques
        query =
          "SELECT id, url, title, type FROM Media ORDER BY uploaded_at DESC";
      } else {
        // Pour les requêtes admin, on retourne tout
        query = "SELECT * FROM Media ORDER BY uploaded_at DESC";
      }

      console.log("Exécution de la requête SQL:", query);

      const [rows] = await connection.execute(query);

      // Filtrer les résultats pour ne garder que les médias avec des URL valides
      const validRows = (rows as { url: string }[]).filter(
        (row) =>
          row && row.url && typeof row.url === "string" && row.url.trim() !== ""
      );

      console.log("Résultats récupérés:", {
        count: validRows.length,
        sample: validRows.slice(0, 2),
      });

      return NextResponse.json(validRows);
    } catch (error) {
      console.error("Erreur SQL:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des médias" },
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
