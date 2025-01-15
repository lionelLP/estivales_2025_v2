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
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Vérifier si c'est une route admin
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));

  if (isAdminRoute) {
    if (!token) {
      console.log("No token found");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Vérifier le token et le rôle (userType = 0 pour admin)
      const decoded = await verifyToken(token.value);
      console.log("Decoded token:", decoded); // Pour voir le contenu du token

      if (!decoded || decoded.userType !== 0) {
        console.log("Unauthorized access - userType:", decoded?.userType);
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
