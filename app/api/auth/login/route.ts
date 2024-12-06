import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  username: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Récupérer l'utilisateur par email
      const [users] = await connection.query<User[]>(
        "SELECT id, email, password, username FROM User WHERE email = ?",
        [email]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          { message: "Email ou mot de passe incorrect" },
          { status: 401 }
        );
      }

      const user = users[0];

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Email ou mot de passe incorrect" },
          { status: 401 }
        );
      }

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "votre_secret",
        { expiresIn: "7d" }
      );

      const response = NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
        },
        { status: 200 }
      );

      response.cookies.set({
        name: "token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return response;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
