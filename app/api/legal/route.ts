import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
