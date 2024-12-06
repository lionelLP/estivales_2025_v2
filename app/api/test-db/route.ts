import { testConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const isConnected = await testConnection();

    if (isConnected) {
      return NextResponse.json({
        message: "Connexion à la base de données réussie",
      });
    } else {
      return NextResponse.json(
        {
          message: "Échec de la connexion à la base de données",
        },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        message: "Erreur lors du test de connexion",
      },
      { status: 500 }
    );
  }
}
