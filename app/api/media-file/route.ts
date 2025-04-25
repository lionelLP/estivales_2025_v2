import { promises as fs } from "fs";
import { stat } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // Récupérer le chemin du fichier depuis les paramètres de requête
    const url = new URL(request.url);
    const filePath = url.searchParams.get("path");

    if (!filePath) {
      return NextResponse.json(
        { error: "Paramètre 'path' manquant" },
        { status: 400 }
      );
    }

    // Vérifier et nettoyer le chemin pour éviter les attaques de traversée de répertoire
    const normalizedPath = path
      .normalize(filePath)
      .replace(/^(\.\.(\/|\\|$))+/, "");

    // Construire le chemin complet vers le fichier
    const fullPath = path.join(process.cwd(), "public", normalizedPath);

    // Vérifier si le fichier existe
    try {
      const stats = await stat(fullPath);
      if (!stats.isFile()) {
        return NextResponse.json(
          { error: "Ce n'est pas un fichier valide" },
          { status: 404 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      );
    }

    // Lire le fichier
    const fileBuffer = await fs.readFile(fullPath);

    // Déterminer le type MIME en fonction de l'extension
    const ext = path.extname(fullPath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".pdf": "application/pdf",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";

    // Retourner le fichier avec le bon type MIME
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du fichier:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du fichier" },
      { status: 500 }
    );
  }
}
