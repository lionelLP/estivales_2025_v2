import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

interface User extends RowDataPacket {
  id: number;
  email: string;
  password: string;
  username: string;
  userType: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log("Tentative de connexion pour:", email);

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
        "SELECT id, email, password, username, userType FROM User WHERE email = ?",
        [email]
      );

      console.log("Résultat de la requête:", users);

      if (!Array.isArray(users) || users.length === 0) {
        console.log("Aucun utilisateur trouvé avec cet email");
        return NextResponse.json(
          { message: "Email ou mot de passe incorrect" },
          { status: 401 }
        );
      }

      const user = users[0];
      console.log("Utilisateur trouvé:", {
        id: user.id,
        email: user.email,
        userType: user.userType,
      });

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log("Mot de passe valide:", isPasswordValid);

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Email ou mot de passe incorrect" },
          { status: 401 }
        );
      }

      // Générer le token JWT
      const token = await new jose.SignJWT({
        userId: user.id,
        userType: Number(user.userType),
        email: user.email,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("7d")
        .sign(
          new TextEncoder().encode(process.env.JWT_SECRET || "votre_secret")
        );

      // Pour déboguer
      console.log("User data:", {
        id: user.id,
        userType: user.userType,
        email: user.email,
      });

      // Pour debug - URL de la requête
      const requestUrl = request.headers.get("host") || "";
      console.log("Request URL host:", requestUrl);

      const response = NextResponse.json(
        {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            userType: user.userType,
          },
        },
        { status: 200 }
      );

      // Pour environnement de développement, définir domaine basé sur l'hôte actuel
      const cookieOptions = {
        name: "token",
        value: token,
        httpOnly: true,
        secure: false, // Désactiver secure en développement pour permettre http
        sameSite: "lax" as const,
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 jours en secondes
      };

      // En production, on utilise le domaine spécifique et secure: true
      if (process.env.NODE_ENV === "production" && process.env.DOMAIN) {
        Object.assign(cookieOptions, {
          domain: process.env.DOMAIN,
          secure: true,
        });
      }

      console.log("Cookie options:", { ...cookieOptions, value: "[HIDDEN]" });
      response.cookies.set(cookieOptions);

      return response;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
