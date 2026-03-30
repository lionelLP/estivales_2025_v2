import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) return false;
  const user = await verifyToken(token.value);
  return user?.userType === 0;
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Accès administrateur requis" }, { status: 403 });
  }

  const { id } = await params;
  const connection = await pool.getConnection();
  try {
    await connection.execute("DELETE FROM OeuvreResource WHERE id = ?", [id]);
    return NextResponse.json({ message: "Ressource supprimée" });
  } catch (error) {
    console.error("Erreur DELETE /api/oeuvres/resources/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    connection.release();
  }
}
