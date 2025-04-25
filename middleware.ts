import { verifyToken } from "@/lib/auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const path = request.nextUrl.pathname;

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
      // Passer le paramètre de redirection pour indiquer d'où vient l'utilisateur
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(path)}`, request.url)
      );
    }

    try {
      // Vérifier le token et le rôle (userType = 0 pour admin)
      const decoded = await verifyToken(token.value);

      // Vérifier explicitement que decoded existe et que userType est bien 0 (admin)
      if (!decoded || decoded.userType !== 0) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
