import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const eventId = formData.get('eventId');

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}_${file.name}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'brochures', filename);

    await writeFile(filepath, buffer);
    const relativePath = `/uploads/brochures/${filename}`;

    return NextResponse.json({ path: relativePath });
  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
} 