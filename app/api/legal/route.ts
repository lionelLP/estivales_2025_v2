import { verifyToken } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { apiMiddleware } from "../middleware";

interface LegalContent {
  html_content: string;
}

// GET reste public car les mentions légales doivent être accessibles à tous
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
  // Vérification du middleware API
  const middlewareResponse = await apiMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  // Vérification du token
  const token = request.cookies.get("token");
  if (!token) {
    return NextResponse.json(
      { error: "Non autorisé - Token manquant" },
      { status: 401 }
    );
  }

  try {
    // Vérification que l'utilisateur est bien un admin
    const decoded = await verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json(
        { error: "Non autorisé - Token invalide" },
        { status: 401 }
      );
    }

    if (decoded.userType !== 0) {
      // 0 = ADMIN
      return NextResponse.json(
        { error: "Non autorisé - Accès administrateur requis" },
        { status: 403 }
      );
    }

    // Validation du contenu
    const { html_content } = await request.json();
    if (!html_content || typeof html_content !== "string") {
      return NextResponse.json(
        { error: "Contenu HTML invalide" },
        { status: 400 }
      );
    }

    // Insertion avec une limite de taille raisonnable
    if (html_content.length > 100000) {
      // 100KB limit
      return NextResponse.json(
        { error: "Contenu trop volumineux" },
        { status: 400 }
      );
    }

    // Sanitize HTML content here if needed
    // const sanitizedContent = sanitizeHtml(html_content);

    await db.execute(
      "INSERT INTO LegalContent (html_content, created_at) VALUES (?, NOW())",
      [html_content]
    );

    return NextResponse.json(
      { message: "Contenu légal mis à jour avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du contenu légal:", error);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde du contenu" },
      { status: 500 }
    );
  }
}
