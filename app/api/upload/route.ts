import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "-" + file.name.replaceAll(" ", "_");

    // Assurez-vous que ce dossier existe et est accessible en écriture
    const uploadDir = path.join(process.cwd(), "public/uploads");
    await writeFile(path.join(uploadDir, filename), buffer);

    // Retourne l'URL de l'image uploadée
    return NextResponse.json({
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
