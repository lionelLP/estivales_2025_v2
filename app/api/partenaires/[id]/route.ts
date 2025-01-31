import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { unlink, writeFile } from "fs/promises";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import path from "path";

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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Vérification de l'authentification
  const cookieStore = await cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token.value);
    if (!decoded) {
      return NextResponse.json({ message: "Token invalide" }, { status: 401 });
    }

    const formData = await request.formData();
    const { id } = await context.params;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const website_url = formData.get("website_url") as string;
    const logo = formData.get("logo") as File | null;
    const banner = formData.get("banner") as File | null;

    const connection = await pool.getConnection();
    try {
      let logoUrl = null;
      let bannerUrl = null;

      if (logo) {
        const logoFileName = `${Date.now()}-${logo.name}`;
        const logoPath = path.join(
          process.cwd(),
          "public/uploads/partners",
          logoFileName
        );
        const logoBuffer = Buffer.from(await logo.arrayBuffer());
        await writeFile(logoPath, logoBuffer);
        logoUrl = `/uploads/partners/${logoFileName}`;
      }

      if (banner) {
        const bannerFileName = `${Date.now()}-${banner.name}`;
        const bannerPath = path.join(
          process.cwd(),
          "public/uploads/partners",
          bannerFileName
        );
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
      { error: "Error updating partner" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const connection = await pool.getConnection();

  try {
    const { id } = await context.params;
    // First, get the current files to delete them
    const [existingPartners] = await connection.execute(
      "SELECT logo_url, banner_url FROM Partenaire WHERE id = ?",
      [id]
    );

    interface Partner {
      logo_url: string | null;
      banner_url: string | null;
    }

    const existingPartner = (existingPartners as Partner[])[0];
    if (!existingPartner) {
      connection.release();
      return NextResponse.json(
        { message: "Partenaire non trouvé" },
        { status: 404 }
      );
    }

    // Delete the files from the filesystem
    const uploadsDir = path.join(process.cwd(), "public");

    try {
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
      { message: "Erreur lors de la suppression du partenaire" },
      { status: 500 }
    );
  }
}
