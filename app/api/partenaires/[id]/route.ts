import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { mkdir, unlink, writeFile } from "fs/promises";
import { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import path from "path";

interface PartenaireRow extends RowDataPacket {
  id: number;
  logo_url: string | null;
  banner_url: string | null;
}

function isFile(value: any): value is File {
  return value && typeof value === "object" && "arrayBuffer" in value;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const connection = await pool.getConnection();
    try {
      const { id } = await context.params;
      const [rows] = await connection.execute(
        "SELECT * FROM Partenaire WHERE id = ?",
        [id]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { error: "Partenaire non trouvé" },
          { status: 404 }
        );
      }

      return NextResponse.json(rows[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du partenaire" },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour vérifier l'authentification admin
async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return false;
  }

  const decoded = await verifyToken(token.value);
  return decoded && decoded.userType === 0; // 0 = ADMIN
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Vérification admin
  if (!(await checkAdminAuth())) {
    return NextResponse.json(
      { error: "Non autorisé - Accès administrateur requis" },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const { id } = await context.params;

    // Validation des données
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const website_url = formData.get("website_url") as string;
    const logo = formData.get("logo");
    const banner = formData.get("banner");

    if (!name || !description || !website_url) {
      return NextResponse.json(
        { error: "Les champs name, description et website_url sont requis" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      const uploadsDir = path.join(process.cwd(), "public/uploads/partners");
      await mkdir(uploadsDir, { recursive: true });

      let logoUrl = null;
      let bannerUrl = null;

      if (isFile(logo)) {
        const logoFileName = `${Date.now()}-${logo.name}`;
        const logoPath = path.join(uploadsDir, logoFileName);
        const logoBuffer = Buffer.from(await logo.arrayBuffer());
        await writeFile(logoPath, logoBuffer);
        logoUrl = `/uploads/partners/${logoFileName}`;
      }

      if (isFile(banner)) {
        const bannerFileName = `${Date.now()}-${banner.name}`;
        const bannerPath = path.join(uploadsDir, bannerFileName);
        const bannerBuffer = Buffer.from(await banner.arrayBuffer());
        await writeFile(bannerPath, bannerBuffer);
        bannerUrl = `/uploads/partners/${bannerFileName}`;
      }

      let query =
        "UPDATE Partenaire SET name = ?, description = ?, website_url = ?";
      const params = [name, description, website_url];

      if (logoUrl) {
        query += ", logo_url = ?";
        params.push(logoUrl);
      }
      if (bannerUrl) {
        query += ", banner_url = ?";
        params.push(bannerUrl);
      }

      query += " WHERE id = ?";
      params.push(id);

      const [result] = await connection.execute(query, params);

      return NextResponse.json({ success: true, result });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de la mise à jour du partenaire" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Vérification admin
  if (!(await checkAdminAuth())) {
    return NextResponse.json(
      { error: "Non autorisé - Accès administrateur requis" },
      { status: 403 }
    );
  }

  const connection = await pool.getConnection();

  try {
    const { id } = await context.params;

    // Vérification que le partenaire existe
    const [existingPartners] = await connection.execute<PartenaireRow[]>(
      "SELECT logo_url, banner_url FROM Partenaire WHERE id = ?",
      [id]
    );

    if (!existingPartners || existingPartners.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: "Partenaire non trouvé" },
        { status: 404 }
      );
    }

    // Delete the files from the filesystem
    const uploadsDir = path.join(process.cwd(), "public");

    try {
      const existingPartner = existingPartners[0];
      if (existingPartner.logo_url) {
        await unlink(path.join(uploadsDir, existingPartner.logo_url));
      }
      if (existingPartner.banner_url) {
        await unlink(path.join(uploadsDir, existingPartner.banner_url));
      }
    } catch (error) {
      console.error("Error deleting files:", error);
      // Continue with deletion even if file deletion fails
    }

    // Delete from database
    await connection.execute("DELETE FROM Partenaire WHERE id = ?", [id]);
    connection.release();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner:", error);
    connection.release();
    return NextResponse.json(
      { error: "Erreur lors de la suppression du partenaire" },
      { status: 500 }
    );
  }
}
