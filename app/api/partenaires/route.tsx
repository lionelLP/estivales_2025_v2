import pool from "@/lib/db/mysql";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { NextRequest } from "next/server";
import path from "path";
import { verifyToken } from "@/lib/auth/jwt";
import { apiMiddleware } from "@/app/api/middleware";

export async function GET() {
  try {
    console.log("Attempting to get database connection...");
    const connection = await pool.getConnection();

    try {
      console.log("Executing SQL query...");
      const [rows] = await connection.execute(
        "SELECT * FROM Partenaire ORDER BY name ASC"
      );
      console.log(
        "Query successful, row count:",
        Array.isArray(rows) ? rows.length : 0
      );
      return NextResponse.json(rows);
    } catch (error) {
      console.error("SQL Error details:", {
        message: error.message,
        code: error.code,
        state: error.sqlState,
      });
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération des partenaires",
          details: error.message,
        },
        { status: 500 }
      );
    } finally {
      console.log("Releasing database connection...");
      connection.release();
    }
  } catch (error) {
    console.error("Connection Error details:", {
      message: error.message,
      code: error.code,
      name: error.name,
    });
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Vérification du middleware
  const middlewareResponse = await apiMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }

  // Vérification du rôle admin
  const token = request.cookies.get("token");
  if (!token) {
    return NextResponse.json(
      { error: "Non autorisé - Token manquant" },
      { status: 401 }
    );
  }

  try {
    const decoded = await verifyToken(token.value);
    if (!decoded || decoded.userType !== 0) {
      return NextResponse.json(
        { error: "Non autorisé - Accès administrateur requis" },
        { status: 403 }
      );
    }

    const connection = await pool.getConnection();

    try {
      const data = await request.formData();
      const name = data.get("name") as string;
      const description = data.get("description") as string;
      const website_url = data.get("website_url") as string;
      const logo = data.get("logo") as File;
      const banner = data.get("banner") as File;

      const logoFileName = `${Date.now()}-${logo.name}`;
      const bannerFileName = `${Date.now()}-${banner.name}`;

      const uploadsDir = path.join(process.cwd(), "public/uploads/partners");
      const logoPath = path.join(uploadsDir, logoFileName);
      const bannerPath = path.join(uploadsDir, bannerFileName);

      const logoBuffer = Buffer.from(await logo.arrayBuffer());
      const bannerBuffer = Buffer.from(await banner.arrayBuffer());

      await writeFile(logoPath, logoBuffer);
      await writeFile(bannerPath, bannerBuffer);

      const logoUrl = `/uploads/partners/${logoFileName}`;
      const bannerUrl = `/uploads/partners/${bannerFileName}`;

      const [result] = await connection.execute(
        "INSERT INTO Partenaire (name, description, website_url, logo_url, banner_url) VALUES (?, ?, ?, ?, ?)",
        [name, description, website_url, logoUrl, bannerUrl]
      );

      return NextResponse.json({ success: true, result });
    } catch (error) {
      console.error("Error in partner creation:", error);
      return NextResponse.json(
        { error: "Error creating partner" },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
