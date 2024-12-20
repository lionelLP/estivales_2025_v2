import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const articles = await query("SELECT * FROM articles WHERE id = ?", [
      parseInt(params.id),
    ]);

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { error: "Article non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(articles[0]);
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
