import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface OeuvreRow extends RowDataPacket {
  id: number;
  title: string;
  composer: string | null;
  description: string | null;
  is_published: number;
}

interface OeuvreResourceRow extends RowDataPacket {
  id: number;
  oeuvre_id: number;
  resource_kind: "partition" | "audio";
  source_kind: "file" | "link";
  title: string | null;
  url: string;
  mime_type: string | null;
  display_order: number;
}

async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) return null;
  return verifyToken(token.value);
}

function groupResources(
  oeuvres: OeuvreRow[],
  resources: OeuvreResourceRow[]
) {
  return oeuvres.map((oeuvre) => ({
    ...oeuvre,
    is_published: oeuvre.is_published === 1,
    resources: resources.filter((resource) => resource.oeuvre_id === oeuvre.id),
  }));
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.userType !== 0 && user.userType !== 1)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const url = new URL(request.url);
  const includeDrafts = url.searchParams.get("includeDrafts") === "true";
  const isAdminRequest = includeDrafts && user.userType === 0;

  const connection = await pool.getConnection();
  try {
    const [oeuvreRows] = await connection.execute<OeuvreRow[]>(
      isAdminRequest
        ? `SELECT * FROM Oeuvre ORDER BY title ASC, id ASC`
        : `SELECT * FROM Oeuvre WHERE is_published = 1 ORDER BY title ASC, id ASC`
    );

    if (oeuvreRows.length === 0) {
      return NextResponse.json([]);
    }

    const oeuvreIds = oeuvreRows.map((o) => o.id);
    const placeholders = oeuvreIds.map(() => "?").join(",");

    const [resourceRows] = await connection.execute<OeuvreResourceRow[]>(
      `SELECT * FROM OeuvreResource WHERE oeuvre_id IN (${placeholders})
       ORDER BY display_order ASC, id ASC`,
      oeuvreIds
    );

    return NextResponse.json(groupResources(oeuvreRows, resourceRows));
  } catch (error) {
    console.error("Erreur GET /api/oeuvres:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.userType !== 0) {
    return NextResponse.json({ error: "Accès administrateur requis" }, { status: 403 });
  }

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
      const [result] = await connection.execute(
        `INSERT INTO Oeuvre (title, composer, description, is_published)
         VALUES (?, ?, ?, ?)`,
        [title.trim(), composer, description, is_published ? 1 : 0]
      );

      const insertId = (result as { insertId: number }).insertId;
      return NextResponse.json({ id: insertId, message: "Oeuvre créée" }, { status: 201 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur POST /api/oeuvres:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
