import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ResultSetHeader } from "mysql2";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name: username } = body;

    if (!email || !password || !username) {
      return NextResponse.json(
        { message: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Vérifier si l'email existe déjà
      const [existingUsers] = await connection.query(
        "SELECT email FROM User WHERE email = ?",
        [email]
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json(
          { message: "Cet email est déjà utilisé" },
          { status: 400 }
        );
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insérer le nouvel utilisateur
      const [result] = await connection.query<ResultSetHeader>(
        "INSERT INTO User (username, password, email, userType, description) VALUES (?, ?, ?, ?, ?)",
        [username, hashedPassword, email, 1, null] // userType 1 pour utilisateur standard
      );

      const token = jwt.sign(
        { userId: result.insertId },
        process.env.JWT_SECRET || "votre_secret",
        { expiresIn: "7d" }
      );

      const user = {
        id: result.insertId,
        email,
        username,
      };

      const response = NextResponse.json(
        { success: true, user },
        { status: 201 }
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
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
