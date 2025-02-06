import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { apiMiddleware } from "../middleware";

interface LegalContent {
  html_content: string;
}

export async function GET() {
  try {
    const [rows] = (await db.execute(
      "SELECT html_content FROM LegalContent ORDER BY created_at DESC LIMIT 1"
    )) as [LegalContent[], unknown];

    return NextResponse.json(rows[0] || { html_content: "" });
  } catch (error) {
    console.error("Erreur lors de la récupération du contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du contenu" },
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

    const { html_content } = await request.json();

    await db.execute("INSERT INTO LegalContent (html_content) VALUES (?)", [
      html_content,
    ]);

    return NextResponse.json({ message: "Contenu sauvegardé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du contenu" },
      { status: 500 }
    );
  }
}
