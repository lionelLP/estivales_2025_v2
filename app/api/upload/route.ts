import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { convertToWebP, isImage } from "@/lib/imageTransformer";

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

    // Verify that the uploaded file is a supported image format
    if (!isImage(file.name)) {
      return NextResponse.json(
        { error: "Format de fichier non supporté" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_");
    const filename = `${Date.now()}_${originalName}.webp`;

    // Convert the image to WebP using the central transformer
    const webpBuffer = await convertToWebP(buffer);

    const uploadDir = path.join(process.cwd(), "public/uploads");
    await writeFile(path.join(uploadDir, filename), webpBuffer);

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
