import pool from "@/lib/db/mysql";
import { MediaType, transformMediaUrls } from "@/lib/utils/media-utils";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { apiMiddleware } from "../middleware";

export async function GET(request: NextRequest) {
  try {
    const connection = await pool.getConnection();
    try {
      const isPublicRequest =
        request.headers.get("x-public-request") === "true";

      let query = `
        SELECT id, url, title, type 
        FROM Media 
        WHERE url IS NOT NULL AND is_published = 1
        ORDER BY uploaded_at DESC
      `;

      if (!isPublicRequest) {
        query = `
          SELECT * 
          FROM Media 
          WHERE url IS NOT NULL
          ORDER BY uploaded_at DESC
        `;
      }

      const [rows] = await connection.execute(query);
      // Transformer les URLs pour utiliser l'API de fichiers dynamiques si nécessaire
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

export async function POST(request: NextRequest) {
  console.log("Début du traitement POST /api/medias");

  // Vérifier si la requête est autorisée
  const middlewareResponse = await apiMiddleware(request);
  if (middlewareResponse.status !== 200) {
    console.log("Middleware a rejeté la requête:", middlewareResponse.status);
    return middlewareResponse;
  }

  try {
    // Récupérer et vérifier le body
    let body;
    try {
      body = await request.json();
      console.log("Body reçu:", JSON.stringify(body));
    } catch (parseError) {
      console.error("Erreur de parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Format de requête invalide" },
        { status: 400 }
      );
    }

    const { title, url, type } = body;

    if (!url) {
      console.log("URL manquante dans la requête");
      return NextResponse.json({ error: "L'URL est requise" }, { status: 400 });
    }

    console.log("Connexion à la base de données");
    const connection = await pool.getConnection();

    try {
      // Vérifier si l'URL est un lien YouTube pour les vidéos
      if (type === "video/youtube") {
        console.log("Vérification d'URL YouTube:", url);
        if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
          console.log("URL YouTube invalide");
          return NextResponse.json(
            { error: "L'URL doit être un lien YouTube valide" },
            { status: 400 }
          );
        }
      }

      // Vérifier la structure de la table Media pour déterminer les champs disponibles
      console.log("Vérification de la structure de la table Media");
      const [tableInfo] = await connection.execute("DESCRIBE Media");
      const columns = (tableInfo as { Field: string }[]).map(
        (col) => col.Field
      );
      console.log("Colonnes disponibles:", columns);

      // Préparer les données pour l'insertion
      const mediaTitle = title || "Sans titre";
      const mediaType = type || "image/webp";

      // Construire la requête en fonction des colonnes disponibles
      let query, params;

      if (columns.includes("is_published")) {
        console.log("Utilisation de la colonne is_published");
        query =
          "INSERT INTO Media (title, url, type, is_published) VALUES (?, ?, ?, ?)";
        params = [mediaTitle, url, mediaType, 1];
      } else {
        console.log(
          "La colonne is_published n'existe pas, utilisation d'une requête simplifiée"
        );
        query = "INSERT INTO Media (title, url, type) VALUES (?, ?, ?)";
        params = [mediaTitle, url, mediaType];
      }

      console.log("Requête SQL:", query);
      console.log("Paramètres:", params);

      // Insérer le nouveau média
      try {
        const [result] = await connection.execute(query, params);

        console.log("Insertion réussie, résultat:", result);

        // Récupérer l'ID du média créé
        const mediaId = (result as { insertId: number }).insertId;

        if (!mediaId) {
          throw new Error("Impossible de récupérer l'ID du média créé");
        }

        // Récupérer les données complètes du média pour la réponse
        const [mediaRows] = await connection.execute(
          `SELECT * FROM Media WHERE id = ?`,
          [mediaId]
        );

        if (!mediaRows || !(mediaRows as { id: number }[])[0]) {
          throw new Error("Média créé mais impossible de le récupérer");
        }

        const mediaData = (mediaRows as { id: number }[])[0];
        // Transformer l'URL pour utiliser l'API de fichiers dynamiques si nécessaire
        const transformedMediaData = {
          ...mediaData,
          url: transformMediaUrls([mediaData as MediaType])[0].url,
        };

        console.log("Média créé avec succès:", transformedMediaData);
        return NextResponse.json(transformedMediaData);
      } catch (dbError) {
        console.error("Erreur SQL lors de l'insertion:", dbError);
        throw new Error(
          `Erreur lors de l'insertion en base de données: ${
            dbError instanceof Error ? dbError.message : String(dbError)
          }`
        );
      }
    } finally {
      connection.release();
      console.log("Connexion à la base de données libérée");
    }
  } catch (error) {
    console.error("Erreur lors de la création du média:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      {
        error: "Erreur lors de la création du média",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
