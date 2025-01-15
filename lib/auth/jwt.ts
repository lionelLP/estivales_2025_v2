import * as jose from "jose";

interface DecodedToken {
  userId: number;
  userType: number;
  exp: number;
}

export async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "votre_secret"
    );

    const { payload } = await jose.jwtVerify(token, secret);

    console.log("Token verification result:", payload);

    return payload as DecodedToken;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}
