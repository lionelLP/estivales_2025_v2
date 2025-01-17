import pool from "@/lib/db/mysql";
import { NextResponse } from "next/server";
import * as mysql from 'mysql2/promise';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await pool.getConnection();
    try {
      const [articles] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM Article WHERE id = ?",
        [parseInt(params.id)]
      );

      if (!articles || !Array.isArray(articles) || articles.length === 0) {
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, link, content, Creation_article, image, favicon } = body;

    await query(
      `UPDATE articles 
       SET title = ?, 
           link = ?, 
           content = ?, 
           Creation_article = ?, 
           image = ?, 
           favicon = ?
       WHERE id = ?`,
      [
        title,
        link,
        content,
        Creation_article,
        image,
        favicon,
        parseInt(params.id),
      ]
    );

    return NextResponse.json({ message: "Article mis à jour avec succès" });
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
  { params }: { params: { id: string } }
) {
  try {
    const connection = await pool.getConnection();
    try {
      // Check if article exists first
      const [article] = await connection.execute(
        "SELECT id FROM Article WHERE id = ?",
        [parseInt(params.id)]
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
        [parseInt(params.id)]
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
