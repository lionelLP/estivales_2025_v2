import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le token
    const decoded = await verifyToken(token.value);

    if (!decoded) {
      return NextResponse.json({ message: "Token invalide" }, { status: 401 });
    }

    return NextResponse.json({
      id: decoded.userId,
      email: decoded.email,
      userType: decoded.userType,
    });
  } catch (error) {
    console.error("Erreur auth/check:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
