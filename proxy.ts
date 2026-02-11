import {verifyToken} from "@/lib/auth/jwt";
import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

export async function proxy(request: NextRequest) {
    const token = request.cookies.get("token");
    const path = request.nextUrl.pathname;

    // Routes qui nécessitent une authentification administrateur
    const adminRoutes = ["/admin"];

    // Routes qui nécessitent une authentification
    const authRoutes = ["/profile"];

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

    // Vérifie si route admin
    if (adminRoutes.some(route => path.startsWith(route))) {
        if (!token?.value) {
            return NextResponse.redirect(
                new URL(`/login?from=${encodeURIComponent(path)}`, request.url)
            );
        }

        try {
            const decoded = await verifyToken(token.value);
            if (!decoded || decoded.userType !== 0) {
                return NextResponse.redirect(new URL("/unauthorized", request.url));
            }
        } catch {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // Vérifie si une route nécessite une connexion
    if (authRoutes.some(route => path.startsWith(route))) {
        if (!token?.value) {
            return NextResponse.redirect(
                new URL(`/login?from=${encodeURIComponent(path)}`, request.url)
            );
        }

        try {
            await verifyToken(token.value);
        } catch {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
