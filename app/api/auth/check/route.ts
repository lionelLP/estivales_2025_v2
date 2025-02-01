import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface DecodedToken {
  userId: number;
  email: string;
  userType: number;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le token
    const decodedToken = await verifyToken(token.value);

    if (!decodedToken || !("email" in decodedToken)) {
      return NextResponse.json({ message: "Token invalide" }, { status: 401 });
    }

    const decoded = decodedToken as DecodedToken;

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
