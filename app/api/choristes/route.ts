import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const decoded = await verifyToken(token.value);
    if (!decoded || (decoded.userType !== 0 && decoded.userType !== 1)) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        "SELECT id, username, email, description, userType FROM User WHERE userType = 1 ORDER BY username ASC"
      );
      return NextResponse.json({ users });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur GET /api/choristes:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
