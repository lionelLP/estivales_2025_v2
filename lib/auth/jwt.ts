import * as jose from "jose";

export interface DecodedToken {
  userId: number;
  userType: number;
  email: string;
  exp: number;
}

export async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "votre_secret"
    );

    const { payload } = await jose.jwtVerify(token, secret);

    console.log("Token verification result:", payload);

    // Vérifier si les champs requis existent dans le payload
    // José peut convertir les clés en camelCase ou garder la casse originale
    // Donc nous devons vérifier les deux possibilités
    const hasUserId = payload.userId !== undefined || payload.sub !== undefined;
    const hasUserType = payload.userType !== undefined;
    const hasEmail = payload.email !== undefined;

    if (!hasUserId || !hasUserType || !hasEmail) {
      console.error("Token incomplet, champs manquants:", {
        userId: payload.userId,
        userType: payload.userType,
        email: payload.email,
        sub: payload.sub,
        aud: payload.aud,
        payload,
      });
      return null;
    }

    // Construire l'objet DecodedToken avec les bonnes valeurs
    return {
      userId: Number(payload.userId || payload.sub),
      userType: Number(payload.userType),
      email: String(payload.email),
      exp: payload.exp as number,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}
