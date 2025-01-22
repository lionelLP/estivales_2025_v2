import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export async function apiMiddleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const method = request.method;

  // Routes publiques en lecture seule
  const publicReadRoutes = {
    "/api/articles": ["GET"],
    "/api/about": ["GET"],
    "/api/medias": ["GET"],
    "/api/partenaires": ["GET"],
    "/api/events": ["GET"],
  };

  // Vérifier si la route est publique et si la méthode est autorisée
  if (publicReadRoutes[path] && publicReadRoutes[path].includes(method)) {
    const newRequest = new Request(request.url, {
      method: request.method,
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        "x-public-request": "true",
      }),
    });
    return NextResponse.next({
      request: newRequest,
    });
  }

  // Vérifier le token pour toutes les autres routes
  const token = request.cookies.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Non autorisé - Token manquant" },
      { status: 401 }
    );
  }

  try {
    const decoded = await verifyToken(token.value);
    if (!decoded) {
      throw new Error("Token invalide");
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Erreur de vérification du token:", error);
    return NextResponse.json(
      { error: "Non autorisé - Token invalide" },
      { status: 401 }
    );
  }
}
