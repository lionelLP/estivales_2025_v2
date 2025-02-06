import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import { apiMiddleware } from "@/app/api/middleware";
import { verifyToken } from "@/lib/auth/jwt";

interface Article {
  title: string;
  link: string;
  content: string;
  Creation_article?: string;
  is_published?: number;
  user_id?: number;
  event_id?: number | null;
  image?: string | null;
  favicon?: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const connection = await pool.getConnection();
    try {
      const isPublicRequest =
        request.headers.get("x-public-request") === "true";

      let query = `
        SELECT 
          id, 
          title, 
          link, 
          content, 
          image, 
          favicon, 
          Creation_article 
        FROM Article 
        WHERE is_published = 1 
        ORDER BY Creation_article DESC
      `;

      if (!isPublicRequest) {
        query = `
          SELECT * 
          FROM Article 
          ORDER BY Creation_article DESC
        `;
      }

      const [articles] = await connection.execute(query);
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

export async function POST(request: NextRequest) {
  const middlewareResponse = await apiMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  const token = request.cookies.get("token");
  if (!token) {
    return NextResponse.json(
      { error: "Non autorisé - Token manquant" },
      { status: 401 }
    );
  }

  try {
    const decoded = await verifyToken(token.value);
    if (!decoded || decoded.userType !== 0) {
      return NextResponse.json(
        { error: "Non autorisé - Accès administrateur requis" },
        { status: 403 }
      );
    }

    const body = (await request.json()) as Article;
    const connection = await pool.getConnection();

    try {
      const formattedDate = body.Creation_article
        ? new Date(body.Creation_article)
            .toISOString()
            .slice(0, 19)
            .replace("T", " ")
        : new Date().toISOString().slice(0, 19).replace("T", " ");

      const [result] = await connection.execute(
        `INSERT INTO Article (
          title, link, content, Creation_article, 
          is_published, user_id, event_id, image, favicon
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          body.title,
          body.link,
          body.content,
          formattedDate,
          body.is_published || 1,
          decoded.userId,
          body.event_id || null,
          body.image || null,
          body.favicon || null,
        ]
      );

      return NextResponse.json({
        message: "Article créé avec succès",
        result,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la requête" },
      { status: 500 }
    );
  }
}
