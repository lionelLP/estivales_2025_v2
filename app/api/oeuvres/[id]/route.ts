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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Accès administrateur requis" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const {
      title,
      composer = null,
      description = null,
      is_published = true,
    } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `UPDATE Oeuvre
         SET title = ?, composer = ?, description = ?, is_published = ?
         WHERE id = ?`,
        [title.trim(), composer, description, is_published ? 1 : 0, id]
      );

      return NextResponse.json({ message: "Oeuvre mise à jour" });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur PUT /api/oeuvres/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
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
    await connection.execute("DELETE FROM Oeuvre WHERE id = ?", [id]);
    return NextResponse.json({ message: "Oeuvre supprimée" });
  } catch (error) {
    console.error("Erreur DELETE /api/oeuvres/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    connection.release();
  }
}
