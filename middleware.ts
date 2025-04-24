import { verifyToken } from "@/lib/auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const path = request.nextUrl.pathname;
  const hostname = request.headers.get("host") || "";

  // Afficher tous les cookies pour le débogage
  const allCookies = request.cookies.getAll();
  console.log(
    "Middleware - All cookies:",
    allCookies.map((c) => c.name)
  );

  console.log("Middleware - Request URL:", {
    hostname,
    path,
    fullUrl: request.url,
    hasToken: !!token,
    tokenValue: token
      ? token.value
        ? "token présent"
        : "token vide"
      : "pas de token",
  });

  // Routes qui nécessitent une authentification administrateur
  const adminRoutes = ["/admin"];

  // Ne pas appliquer le middleware aux routes statiques et API
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api/") ||
    path.includes(".") ||
    path === "/login" ||
    path === "/unauthorized"
  ) {
    return NextResponse.next();
  }

  // Vérifier si c'est une route admin
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

  if (isAdminRoute) {
    if (!token || !token.value) {
      console.log("No token found or token empty");
      // Passer le paramètre de redirection pour indiquer d'où vient l'utilisateur
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(path)}`, request.url)
      );
    }

    try {
      // Vérifier le token et le rôle (userType = 0 pour admin)
      const decoded = await verifyToken(token.value);
      console.log("Decoded token in middleware:", decoded);

      // Vérifier explicitement que decoded existe et que userType est bien 0 (admin)
      if (!decoded || decoded.userType !== 0) {
        console.log("Unauthorized access - userType:", decoded?.userType);
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      console.log(
        "Access granted to admin route for user with ID:",
        decoded.userId
      );
    } catch (error) {
      console.error("Token verification error in middleware:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
