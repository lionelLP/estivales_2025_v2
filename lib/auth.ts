import jwt from "jsonwebtoken";
import type { NextAuthOptions } from "next-auth";

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  // ... configuration de next-auth ...
  providers: [],
  // Ajoutez ici votre configuration d'authentification
};
