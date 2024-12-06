import { NextResponse } from "next/server";
import pool from "@/lib/db/mysql";

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
      
      return NextResponse.json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des médias:", error);
    return NextResponse.json(
      { error: "Erreur serveur" }, 
      { status: 500 }
    );
  }
} 