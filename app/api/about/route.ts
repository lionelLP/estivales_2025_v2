import { NextResponse } from "next/server";
import pool from "@/lib/db/mysql";

export async function GET() {
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

export async function POST(request: Request) {
  try {
    const { html_content } = await request.json();
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        "SELECT COUNT(*) as count FROM AboutContent"
      );
      const count = (rows as any)[0].count;

      if (count === 0) {
        await connection.execute(
          "INSERT INTO AboutContent (html_content) VALUES (?)",
          [html_content]
        );
      } else {
        await connection.execute(
          "UPDATE AboutContent SET html_content = ? ORDER BY updated_at DESC LIMIT 1",
          [html_content]
        );
      }

      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}