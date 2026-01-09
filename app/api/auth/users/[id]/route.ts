import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { ResultSetHeader } from "mysql2";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, context: any) {
  try {
    const params = context?.params ? await context.params : {};
    const idStr = params?.id ?? (() => {
      try {
        const url = new URL(request.url);
        const parts = url.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1];
      } catch {
        return undefined;
      }
    })();

    const userId = idStr ? Number(idStr) : NaN;
    if (Number.isNaN(userId)) {
      return NextResponse.json({ message: "Identifiant invalide" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token) return NextResponse.json({ message: "Non authentifié" }, { status: 401 });

    const decoded = await verifyToken(token.value);
    if (!decoded || decoded.userType !== 0) {
      return NextResponse.json({ message: "Accès administrateur requis" }, { status: 403 });
    }

    if (decoded.userId === userId) {
      return NextResponse.json({ message: "Impossible de supprimer votre propre compte" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      const [userToDelete] = await connection.query(
        "SELECT userType FROM User WHERE id = ?",
        [userId]
      ) as any[];
      
      if (!userToDelete || userToDelete.length === 0) {
        return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
      }

      const isAdminToDelete = userToDelete[0].userType === 0;

      if (isAdminToDelete) {
        const [admins] = await connection.query(
          "SELECT COUNT(*) as count FROM User WHERE userType = 0"
        ) as any[];
        
        if (admins[0].count <= 1) {
          return NextResponse.json(
            { message: "Impossible de supprimer le dernier administrateur" },
            { status: 400 }
          );
        }
      }

      const [result] = await connection.query<ResultSetHeader>("DELETE FROM User WHERE id = ?", [userId]);
      if (result.affectedRows === 0) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur /api/auth/users/[id]:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const params = context?.params ? await context.params : {};
    const userId = Number(params.id);
    if (Number.isNaN(userId)) return NextResponse.json({ message: "Identifiant invalide" }, { status: 400 });

    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    if (!token) return NextResponse.json({ message: "Non authentifié" }, { status: 401 });

    const decoded = await verifyToken(token.value);
    if (!decoded || (decoded.userId !== userId && decoded.userType !== 0)) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const body = await request.json();
    if (body.password || body.currentPassword || body.adminPassword) {
      return NextResponse.json({ message: "Modification du mot de passe désactivée" }, { status: 403 });
    }

    const { username, email, userType } = body;
    if (!username || !email) return NextResponse.json({ message: "Champs requis manquants" }, { status: 400 });

    const connection = await pool.getConnection();
    try {
      const query = "UPDATE User SET username = ?, email = ?, userType = ? WHERE id = ?";
      const paramsQuery = [username, email, userType ?? 1, userId];
      const [result] = await connection.query<ResultSetHeader>(query, paramsQuery);
      if (result.affectedRows === 0) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
      return NextResponse.json({ success: true });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur PUT /api/auth/users/[id]:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
