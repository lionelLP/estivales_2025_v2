import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    // TODO: Vérifier le token JWT
    // Pour l'exemple :
    return NextResponse.json({
      id: "1",
      email: "test@test.com",
      name: "Utilisateur Test",
    });
  } catch (error) {
    console.error("Erreur auth/check:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
