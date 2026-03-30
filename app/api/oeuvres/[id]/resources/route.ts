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

export async function POST(
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
      resource_kind,
      source_kind,
      title = null,
      url,
      mime_type = null,
      display_order = 0,
    } = body;

    if (!["partition", "audio"].includes(resource_kind)) {
      return NextResponse.json(
        { error: "resource_kind invalide (partition|audio)" },
        { status: 400 }
      );
    }

    if (!["file", "link"].includes(source_kind)) {
      return NextResponse.json(
        { error: "source_kind invalide (file|link)" },
        { status: 400 }
      );
    }

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO OeuvreResource
          (oeuvre_id, resource_kind, source_kind, title, url, mime_type, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, resource_kind, source_kind, title, url.trim(), mime_type, Number(display_order) || 0]
      );

      return NextResponse.json(
        { id: (result as { insertId: number }).insertId, message: "Ressource ajoutée" },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur POST /api/oeuvres/[id]/resources:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
