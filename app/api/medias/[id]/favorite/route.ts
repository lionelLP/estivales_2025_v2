import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface Media {
  id: number;
  url: string;
  title: string;
  type: string;
  is_favorite: boolean;
  uploaded_at: Date;
}

export async function GET() {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT id, url, title, type, is_favorite, uploaded_at 
         FROM Media 
         WHERE url IS NOT NULL 
         ORDER BY uploaded_at DESC`
      );

      // Transformer les URLs relatives en URLs absolues si nécessaire
      const medias = (rows as Media[]).map((media) => ({
        ...media,
        url: media.url.startsWith("http") ? media.url : media.url,
      }));

      return NextResponse.json(medias);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des médias:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Vérification de l'authentification directement ici
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json({ message: "Token invalide" }, { status: 401 });
    }

    const connection = await pool.getConnection();
    try {
      // Mettre à jour le statut favori
      await connection.execute(
        `UPDATE Media 
         SET is_favorite = NOT is_favorite 
         WHERE id = ?`,
        [params.id]
      );

      // Récupérer le nouveau statut
      const [rows] = await connection.execute(
        `SELECT is_favorite FROM Media WHERE id = ?`,
        [params.id]
      );

      return NextResponse.json({
        success: true,
        is_favorite: (rows as Media[])[0]?.is_favorite,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du favori:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
