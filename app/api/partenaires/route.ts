import pool from "@/lib/db/mysql";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Attempting to get database connection...");
    const connection = await pool.getConnection();
    
    try {
      console.log("Executing SQL query...");
      const [rows] = await connection.execute(
        "SELECT * FROM Partenaire ORDER BY name ASC"
      );
      console.log("Query successful, row count:", Array.isArray(rows) ? rows.length : 0);
      return NextResponse.json(rows);
    } catch (error) {
      console.error("SQL Error details:", {
        message: error.message,
        code: error.code,
        state: error.sqlState
      });
      return NextResponse.json(
        { error: "Erreur lors de la récupération des partenaires", details: error.message },
        { status: 500 }
      );
    } finally {
      console.log("Releasing database connection...");
      connection.release();
    }
  } catch (error) {
    console.error("Connection Error details:", {
      message: error.message,
      code: error.code,
      name: error.name
    });
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
} 