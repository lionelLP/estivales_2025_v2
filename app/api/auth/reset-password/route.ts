import pool from "@/lib/db/mysql";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

interface ResetRow extends RowDataPacket {
  user_id: number;
}

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    const connection = await pool.getConnection();

    try {
      // Get reset request
      const [resets] = await connection.execute<ResetRow[]>(
        "SELECT user_id FROM PasswordReset WHERE reset_token = ? AND expires_at > NOW() AND used = 0",
        [token]
      );

      if (!Array.isArray(resets) || resets.length === 0) {
        return NextResponse.json(
          { message: "Ce lien de réinitialisation est invalide ou a expiré" },
          { status: 400 }
        );
      }

      const userId = resets[0].user_id;
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password
      await connection.execute("UPDATE User SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);

      // Mark reset token as used
      await connection.execute(
        "UPDATE PasswordReset SET used = 1 WHERE reset_token = ?",
        [token]
      );

      return NextResponse.json({
        message: "Mot de passe mis à jour avec succès",
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
