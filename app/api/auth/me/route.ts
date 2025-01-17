import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface User extends RowDataPacket {
  id: number;
  email: string;
  username: string;
  userType: number;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const decoded = await verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json({ message: "Token invalide" }, { status: 401 });
    }

    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query<User[]>(
        "SELECT id, email, username, userType FROM User WHERE id = ?",
        [decoded.userId]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          { message: "Utilisateur non trouvé" },
          { status: 404 }
        );
      }

      const user = users[0];
      return NextResponse.json({
        id: user.id,
        email: user.email,
        username: user.username,
        userType: user.userType,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur /api/auth/me:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
