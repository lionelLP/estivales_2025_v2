import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const path = request.nextUrl.pathname;

  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  // Ne pas appliquer le middleware aux routes statiques et API
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api/") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si l'utilisateur est connecté et essaie d'accéder aux pages de connexion/inscription
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/(api|trpc)(.*)"],
};
