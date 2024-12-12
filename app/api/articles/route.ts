import pool from "@/lib/db/mysql";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      link,
      content,
      Creation_article,
      is_published = 1,
      user_id = 1,
      event_id = null,
      image,
      favicon,
    } = body;

    if (!title || !link || !content) {
      return NextResponse.json(
        { error: "Titre, lien et contenu sont requis" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    console.log("Connexion à la base de données établie");

    try {
      const formattedDate = Creation_article
        ? new Date(Creation_article).toISOString().slice(0, 19).replace("T", " ")
        : new Date().toISOString().slice(0, 19).replace("T", " ");

      const [result] = await connection.execute(
        `INSERT INTO Article (
          title, link, content, Creation_article, 
          is_published, user_id, event_id, image, favicon
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          link,
          content,
          formattedDate,
          is_published,
          user_id,
          event_id,
          image || null,
          favicon || null,
        ]
      );

      return NextResponse.json({
        message: "Article créé avec succès",
        result,
      });
    } catch (sqlError: any) {
      console.error("Erreur SQL détaillée:", sqlError);
      return NextResponse.json(
        {
          error: "Erreur lors de l'insertion dans la base de données",
          details: sqlError.message,
          sqlMessage: sqlError.sqlMessage,
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur détaillée:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la requête" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const connection = await pool.getConnection();
    try {
      const [articles] = await connection.execute(
        `SELECT * FROM Article ORDER BY Creation_article DESC`
      );
      return NextResponse.json(articles);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des articles" },
      { status: 500 }
    );
  }
}
