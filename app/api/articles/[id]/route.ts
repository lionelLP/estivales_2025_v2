import pool from "@/lib/db/mysql";
import * as mysql from "mysql2/promise";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const connection = await pool.getConnection();
    try {
      const [articles] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM Article WHERE id = ?",
        [parseInt(resolvedParams.id)]
      );

      if (!articles || articles.length === 0) {
        return NextResponse.json(
          { error: "Article non trouvé" },
          { status: 404 }
        );
      }

      return NextResponse.json(articles[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'article:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'article" },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;

    const connection = await pool.getConnection();
    try {
      const body = await request.json();
      const {
        title,
        link,
        content,
        Creation_article,
        image,
        favicon,
        is_published,
        user_id,
        event_id,
      } = body;

      const formattedDate = Creation_article
        ? new Date(Creation_article)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")
        : new Date().toISOString().slice(0, 19).replace("T", " ");

      const [result] = await connection.execute<mysql.ResultSetHeader>(
        `UPDATE Article 
         SET title = ?, 
             link = ?, 
             content = ?, 
             Creation_article = ?, 
             image = ?, 
             favicon = ?,
             is_published = ?,
             user_id = ?,
             event_id = ?
         WHERE id = ?`,
        [
          title,
          link,
          content,
          formattedDate,
          image,
          favicon,
          is_published,
          user_id,
          event_id,
          parseInt(resolvedParams.id),
        ]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: "Article non trouvé" },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Article mis à jour avec succès" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'article:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'article" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const connection = await pool.getConnection();
    try {
      // Check if article exists first
      const [article] = await connection.execute(
        "SELECT id FROM Article WHERE id = ?",
        [parseInt(resolvedParams.id)]
      );

      if (!article || (article as mysql.RowDataPacket[]).length === 0) {
        connection.release();
        return NextResponse.json(
          { error: "Article non trouvé" },
          { status: 404 }
        );
      }

      // Proceed with deletion
      const [result] = await connection.execute(
        "DELETE FROM Article WHERE id = ?",
        [parseInt(resolvedParams.id)]
      );

      if ((result as mysql.ResultSetHeader).affectedRows === 0) {
        connection.release();
        return NextResponse.json(
          { error: "Échec de la suppression" },
          { status: 400 }
        );
      }

      connection.release();
      return NextResponse.json({ message: "Article supprimé avec succès" });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'article:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'article" },
      { status: 500 }
    );
  }
}
