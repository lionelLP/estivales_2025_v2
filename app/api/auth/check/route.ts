import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      console.log("Aucun token trouvé dans les cookies");
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    console.log("Token trouvé, vérification en cours");

    // Vérifier le token
    const decoded = await verifyToken(token.value);

    if (!decoded) {
      console.log("Token invalide ou expiré");
      return NextResponse.json({ message: "Token invalide" }, { status: 401 });
    }

    console.log("Token vérifié avec succès:", {
      id: decoded.userId,
      userType: decoded.userType,
      email: decoded.email,
    });

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
