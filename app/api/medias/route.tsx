import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import pool from "@/lib/db/mysql";
import { apiMiddleware } from "../middleware";

interface Media {
  id: number;
  url: string;
  title: string;
  type: string;
  is_published?: number;
  uploaded_at?: string;
}

export async function GET(request: NextRequest) {
  try {
    const connection = await pool.getConnection();
    try {
      const isPublicRequest =
        request.headers.get("x-public-request") === "true";

      let query = `
        SELECT id, url, title, type 
        FROM Media 
        WHERE url IS NOT NULL AND is_published = 1
        ORDER BY uploaded_at DESC
      `;

      if (!isPublicRequest) {
        query = `
          SELECT * 
          FROM Media 
          WHERE url IS NOT NULL
          ORDER BY uploaded_at DESC
        `;
      }

      const [rows] = await connection.execute(query);
      return NextResponse.json(rows);
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
  // Reste du code existant pour POST
}
