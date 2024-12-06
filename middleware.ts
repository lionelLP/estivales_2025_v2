import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const path = request.nextUrl.pathname;

  // Routes qui nécessitent une authentification
  const protectedRoutes = [
    "/admin",
    "/profil",
    "/evenements/creer",
    "/evenements/*/edit",
    "/partenaires/creer",
    "/partenaires/*/modifier",
    "/medias",
  ];

  // Ne pas appliquer le middleware aux routes statiques et API
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api/") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Vérifier si la route actuelle correspond à une route protégée
  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.includes("*")) {
      const routePattern = new RegExp(route.replace("*", ".*"));
      return routePattern.test(path);
    }
    return path.startsWith(route);
  });

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
