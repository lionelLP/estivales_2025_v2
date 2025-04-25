import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Pour environnement de développement
  const cookieOptions = {
    name: "token",
    value: "",
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: false, // Désactiver secure en développement pour permettre http
    sameSite: "lax" as const,
  };

  // En production, on utilise le domaine spécifique
  if (process.env.NODE_ENV === "production" && process.env.DOMAIN) {
    Object.assign(cookieOptions, {
      domain: process.env.DOMAIN,
      secure: true,
    });
  }

  response.cookies.set(cookieOptions);

  return response;
}
