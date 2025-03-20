import sharp from "sharp";
import path from "path";

/**
 * Convertit un buffer d'image en format WebP
 *
 * @param buffer Buffer de l'image source
 * @returns Buffer de l'image au format WebP
 */
export async function convertToWebP(buffer: Buffer): Promise<Buffer> {
  try {
    console.log("Conversion WebP: Début du processus");

    // Réduire l'utilisation de la mémoire pour éviter les erreurs OOM
    sharp.cache(false);
    sharp.concurrency(1);

    // Configuration pour optimiser la qualité et la taille
    const webpBuffer = await sharp(buffer, { failOn: "none" })
      .resize(1920, 1080, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 85,
        lossless: false,
        effort: 4, // Équilibre entre vitesse et compression (0-6)
      })
      .toBuffer();

    console.log("Conversion WebP: Succès");
    return webpBuffer;
  } catch (error) {
    console.error("Erreur lors de la conversion WebP:", error);

    // Essayer une méthode de secours si la première échoue
    try {
      console.log("Tentative de conversion alternative avec moins d'options");
      const webpBuffer = await sharp(buffer, {
        failOn: "none",
        limitInputPixels: 50000000, // Limite la taille d'entrée maximum
      })
        .webp({ quality: 75 })
        .toBuffer();

      console.log("Conversion alternative réussie");
      return webpBuffer;
    } catch (secondError) {
      console.error("Échec de la méthode alternative:", secondError);
      throw new Error(
        `Impossible de convertir l'image en WebP: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

/**
 * Vérifie si un fichier est une image valide
 *
 * @param filename Nom du fichier à vérifier
 * @returns true si le fichier est une image, false sinon
 */
export function isImage(filename: string): boolean {
  const validExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".webp",
    ".tiff",
    ".tif",
    ".svg",
    ".avif",
    ".heic",
    ".heif",
  ];

  const ext = path.extname(filename).toLowerCase();
  return validExtensions.includes(ext);
}

/**
 * Récupère le type MIME d'une image en fonction de son extension
 *
 * @param filename Nom du fichier
 * @returns Le type MIME correspondant à l'extension du fichier
 */
export function getImageMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();

  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".svg": "image/svg+xml",
    ".tiff": "image/tiff",
    ".tif": "image/tiff",
    ".avif": "image/avif",
    ".heic": "image/heic",
    ".heif": "image/heif",
  };

  return mimeTypes[ext] || "application/octet-stream";
}
