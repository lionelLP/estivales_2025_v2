import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import { apiMiddleware } from "../middleware";
import { verifyToken } from "@/lib/auth/jwt";

interface AboutContent {
  html_content: string;
}

export async function GET(request: NextRequest) {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM AboutContent ORDER BY updated_at DESC LIMIT 1"
      );
      return NextResponse.json(rows[0] || { html_content: "" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
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

    const { html_content } = (await request.json()) as AboutContent;
    if (!html_content) {
      return NextResponse.json(
        { error: "Le contenu HTML est requis" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        "INSERT INTO AboutContent (html_content) VALUES (?) ON DUPLICATE KEY UPDATE html_content = VALUES(html_content)",
        [html_content]
      );

      return NextResponse.json({
        success: true,
        message: "Contenu mis à jour avec succès",
        result,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
