import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ResultSetHeader } from "mysql2";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  // Vérification du rôle admin
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Non autorisé - Token manquant" },
      { status: 401 }
    );
  }

  try {
    const decoded = await verifyToken(token.value);
    if (!decoded || decoded.userType !== 0) {
      return NextResponse.json(
        { error: "Non autorisé - Accès administrateur requis" },
        { status: 403 }
      );
    }

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

      const hashedPassword = await bcrypt.hash(password, 10);
      const userType = body.userType || 1; // Permettre à l'admin de définir le type d'utilisateur

      const [result] = await connection.query<ResultSetHeader>(
        "INSERT INTO User (username, password, email, userType, description) VALUES (?, ?, ?, ?, ?)",
        [username, hashedPassword, email, userType, null]
      );

      return NextResponse.json(
        {
          success: true,
          user: {
            id: result.insertId,
            email,
            username,
            userType,
          },
        },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
