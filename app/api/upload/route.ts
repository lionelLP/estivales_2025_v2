import { getMediaUrl } from "@/lib/utils/media-utils";
import { access, mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const image = formData.get("image") as File;
    const useDynamicUrl = formData.get("useDynamicUrl") === "true";

    if (!file && !image) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = Date.now() + "-" + file.name.replaceAll(" ", "_");
      const uploadDir = path.join(process.cwd(), "public/uploads/brochures");
      // Ensure the directory exists
      try {
        await access(uploadDir);
      } catch {
        await mkdir(uploadDir, { recursive: true });
      }
      await writeFile(path.join(uploadDir, filename), buffer);

      const staticPath = `/uploads/brochures/${filename}`;
      return NextResponse.json({
        path: useDynamicUrl ? getMediaUrl(staticPath) : staticPath,
      });
    }

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const filename = Date.now() + "-" + image.name.replaceAll(" ", "_");
      const uploadDir = path.join(process.cwd(), "public/uploads/images");
      // Ensure the directory exists
      try {
        await access(uploadDir);
      } catch {
        await mkdir(uploadDir, { recursive: true });
      }
      await writeFile(path.join(uploadDir, filename), buffer);

      const staticPath = `/uploads/images/${filename}`;
      return NextResponse.json({
        url: useDynamicUrl ? getMediaUrl(staticPath) : staticPath,
      });
    }
  } catch (error) {
    console.error("Erreur upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload" },
      { status: 500 }
    );
  }
}
