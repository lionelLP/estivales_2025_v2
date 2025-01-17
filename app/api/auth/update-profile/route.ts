import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
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

    const body = await request.json();
    const { email, username, currentPassword, newPassword, confirmPassword } =
      body;

    const connection = await pool.getConnection();

    try {
      // Vérifier si l'email existe déjà pour un autre utilisateur
      if (email) {
        const [existingUsers] = await connection.query(
          "SELECT id FROM User WHERE email = ? AND id != ?",
          [email, decoded.userId]
        );

        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
          return NextResponse.json(
            { message: "Cet email est déjà utilisé" },
            { status: 400 }
          );
        }
      }

      // Si changement de mot de passe demandé
      if (currentPassword && newPassword) {
        if (newPassword !== confirmPassword) {
          return NextResponse.json(
            { message: "Les nouveaux mots de passe ne correspondent pas" },
            { status: 400 }
          );
        }

        // Vérifier l'ancien mot de passe
        const [users] = await connection.query(
          "SELECT password FROM User WHERE id = ?",
          [decoded.userId]
        );

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password
        );

        if (!isPasswordValid) {
          return NextResponse.json(
            { message: "Mot de passe actuel incorrect" },
            { status: 400 }
          );
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le profil avec le nouveau mot de passe
        await connection.query(
          "UPDATE User SET email = ?, username = ?, password = ? WHERE id = ?",
          [email, username, hashedPassword, decoded.userId]
        );
      } else {
        // Mise à jour sans changement de mot de passe
        await connection.query(
          "UPDATE User SET email = ?, username = ? WHERE id = ?",
          [email, username, decoded.userId]
        );
      }

      return NextResponse.json({
        message: "Profil mis à jour avec succès",
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      { message: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
