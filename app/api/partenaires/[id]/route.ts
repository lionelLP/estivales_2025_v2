import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db/mysql";
import { writeFile } from 'fs/promises';
import path from 'path';
import { unlink } from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const connection = await pool.getConnection();
  
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM Partenaire WHERE id = ?',
      [params.id]
    );

    const partners = rows as any[];
    
    if (partners.length === 0) {
      return NextResponse.json(
        { message: "Partenaire non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(partners[0]);
  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      { message: "Erreur lors de la récupération du partenaire" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const connection = await pool.getConnection();
  
  try {
    const [existingPartners] = await connection.execute(
      'SELECT logo_url, banner_url FROM Partenaire WHERE id = ?',
      [params.id]
    );
    
    const existingPartner = (existingPartners as any[])[0];
    if (!existingPartner) {
      return NextResponse.json(
        { message: "Partenaire non trouvé" },
        { status: 404 }
      );
    }

    const data = await request.formData();
    const name = data.get('name') as string;
    const description = data.get('description') as string;
    const website_url = data.get('website_url') as string;
    const logo = data.get('logo') as File | null;
    const banner = data.get('banner') as File | null;

    let logoUrl = existingPartner.logo_url;
    let bannerUrl = existingPartner.banner_url;

    // Handle new file uploads if provided
    if (logo) {
      const logoFileName = `${Date.now()}-${logo.name}`;
      const uploadsDir = path.join(process.cwd(), 'public/uploads/partners');
      const logoPath = path.join(uploadsDir, logoFileName);
      const logoBuffer = Buffer.from(await logo.arrayBuffer());
      await writeFile(logoPath, logoBuffer);
      logoUrl = `/uploads/partners/${logoFileName}`;
    }

    if (banner) {
      const bannerFileName = `${Date.now()}-${banner.name}`;
      const uploadsDir = path.join(process.cwd(), 'public/uploads/partners');
      const bannerPath = path.join(uploadsDir, bannerFileName);
      const bannerBuffer = Buffer.from(await banner.arrayBuffer());
      await writeFile(bannerPath, bannerBuffer);
      bannerUrl = `/uploads/partners/${bannerFileName}`;
    }

    // Update database
    await connection.execute(
      'UPDATE Partenaire SET name = ?, description = ?, website_url = ?, logo_url = ?, banner_url = ? WHERE id = ?',
      [name, description, website_url, logoUrl, bannerUrl, params.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { message: "Erreur lors de la mise à jour du partenaire" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const connection = await pool.getConnection();
  
  try {
    // First, get the current files to delete them
    const [existingPartners] = await connection.execute(
      'SELECT logo_url, banner_url FROM Partenaire WHERE id = ?',
      [params.id]
    );
    
    const existingPartner = (existingPartners as any[])[0];
    if (!existingPartner) {
      return NextResponse.json(
        { message: "Partenaire non trouvé" },
        { status: 404 }
      );
    }

    // Delete the files from the filesystem
    const uploadsDir = path.join(process.cwd(), 'public');
    
    try {
      if (existingPartner.logo_url) {
        await unlink(path.join(uploadsDir, existingPartner.logo_url));
      }
      if (existingPartner.banner_url) {
        await unlink(path.join(uploadsDir, existingPartner.banner_url));
      }
    } catch (error) {
      console.error('Error deleting files:', error);
      // Continue with deletion even if file deletion fails
    }

    // Delete from database
    await connection.execute(
      'DELETE FROM Partenaire WHERE id = ?',
      [params.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression du partenaire" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
} 