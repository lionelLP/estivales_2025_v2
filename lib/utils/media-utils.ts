export type MediaType = {
  id: number;
  url: string;
  title: string;
  type: string;
  is_published?: number;
  uploaded_at?: string;
};

/**
 * Convertit les URLs des médias pour utiliser l'API de fichiers dynamique
 * si nécessaire (pour les fichiers locaux uploadés)
 */
export function getMediaUrl(url: string): string {
  if (!url) return "";

  // Si c'est déjà une URL externe (http ou https), la retourner telle quelle
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Si c'est une URL YouTube intégrée
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return url;
  }

  // Les chemins qui commencent par /uploads/ sont des fichiers locaux uploadés
  if (url.startsWith("/uploads/")) {
    // Utiliser l'API de fichiers pour servir dynamiquement le fichier
    return `/api/media-file?path=${encodeURIComponent(url)}`;
  }

  // Pour les autres chemins, les retourner tels quels
  return url;
}

/**
 * Transforme un tableau de médias pour mettre à jour les URLs selon le besoin
 */
export function transformMediaUrls<T extends MediaType>(medias: T[]): T[] {
  return medias.map((media) => ({
    ...media,
    url: getMediaUrl(media.url),
  }));
}
