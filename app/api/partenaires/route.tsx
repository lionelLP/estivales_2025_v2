import { apiMiddleware } from "@/app/api/middleware";
import { verifyToken } from "@/lib/auth/jwt";
import pool from "@/lib/db/mysql";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

interface SQLError extends Error {
  code?: string;
  sqlState?: string;
}

interface ConnectionError extends Error {
  code?: string;
  name: string;
}

function isFile(value: any): value is File {
  return value && typeof value === "object" && "arrayBuffer" in value;
}

export async function GET() {
  try {
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        "SELECT * FROM Partenaire ORDER BY name ASC"
      );
      return NextResponse.json(rows);
    } catch (error) {
      const err = error as SQLError;
      console.error("SQL Error details:", {
        message: err.message,
        code: err.code,
        state: err.sqlState,
      });
      return NextResponse.json(
        {
          error: "Erreur lors de la récupération des partenaires",
          details: err.message,
        },
        { status: 500 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    const err = error as ConnectionError;
    console.error("Connection Error details:", {
      message: err.message,
      code: err.code,
      name: err.name,
    });
    return NextResponse.json(
      { error: "Erreur serveur", details: err.message },
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
      const logo = data.get("logo");
      const banner = data.get("banner");

      const uploadsDir = path.join(process.cwd(), "public/uploads/partners");
      await mkdir(uploadsDir, { recursive: true });

      let logoUrl = null;
      if (isFile(logo)) {
        const logoFileName = `${Date.now()}-${logo.name}`;
        const logoPath = path.join(uploadsDir, logoFileName);
        const logoBuffer = Buffer.from(await logo.arrayBuffer());
        await writeFile(logoPath, logoBuffer);
        logoUrl = `/uploads/partners/${logoFileName}`;
      }

      let bannerUrl = null;
      if (isFile(banner)) {
        const bannerFileName = `${Date.now()}-${banner.name}`;
        const bannerPath = path.join(uploadsDir, bannerFileName);
        const bannerBuffer = Buffer.from(await banner.arrayBuffer());
        await writeFile(bannerPath, bannerBuffer);
        bannerUrl = `/uploads/partners/${bannerFileName}`;
      }

      const [result] = await connection.execute(
        "INSERT INTO Partenaire (name, description, website_url, logo_url, banner_url) VALUES (?, ?, ?, ?, ?)",
        [name, description, website_url, logoUrl, bannerUrl]
      );

      return NextResponse.json({ success: true, result });
    } catch (error) {
      console.error("Error in partner creation:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Error creating partner" },
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
