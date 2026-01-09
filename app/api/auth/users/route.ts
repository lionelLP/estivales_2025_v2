import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const decoded = await verifyToken(token.value);
    if (!decoded || decoded.userType !== 0) {
      return NextResponse.json({ message: "Accès administrateur requis" }, { status: 403 });
    }

    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        "SELECT id, username, email, userType, created_at FROM User ORDER BY created_at ASC"
      );
      return NextResponse.json({ users });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur GET /api/auth/users:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
