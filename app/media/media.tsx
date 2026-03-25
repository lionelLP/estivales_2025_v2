"use client";

import { getMediaUrl } from "@/lib/utils/media-utils";
import { ParallaxScroll } from "@/components/ui/parallax-scroll";
import { useEffect, useState } from "react";

interface Media {
  id: number;
  url: string;
  title: string;
  type: string;
  is_favorite?: boolean;
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch("/api/media", {
          headers: {
            "x-public-request": "true",
            // Ajouter un cache-buster pour éviter les problèmes de cache
            "cache-control": "no-cache",
            pragma: "no-cache",
          },
          // Ne pas mettre en cache côté client
          cache: "no-store",
        });

        if (response.ok) {
          // Vérifier si le corps de la réponse est vide
          const text = await response.text();

          if (!text || text.trim() === "") {
            console.error("Réponse vide reçue");
            setError("Aucun média disponible");
            return;
          }

          // Transformer le texte en JSON
          let data;
          try {
            data = JSON.parse(text);
          } catch (jsonError) {
            console.error("Erreur de parsing JSON:", jsonError);
            setError("Format de réponse invalide");
            return;
          }

          if (!Array.isArray(data)) {
            console.error("Les données ne sont pas un tableau:", data);
            setError("Format de réponse invalide");
            return;
          }

          const validMedia = data.filter(
            (item: Media) =>
              item &&
              item.url &&
              typeof item.url === "string" &&
              item.url.trim() !== ""
          );

          if (validMedia.length === 0) {
            setError("Aucun média disponible");
          } else {
            const updatedMedia = validMedia.map((item: Media) => ({
              ...item,
              url: getMediaUrl(item.url),
            }));
            setMedia(updatedMedia);
            setError("");
          }
        } else {
          try {
            const errorData = await response.json();
            console.error("Erreur de l'API:", errorData);
            setError(
              errorData.error || "Erreur lors de la récupération des médias"
            );
          } catch (parseError) {
            console.error("Erreur de parsing de l'erreur:", parseError);
            setError(`Erreur du serveur: ${response.status}`);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des médias:", error);
        setError(
          `Erreur de connexion: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Chargement des médias...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto pt-20 px-4">
          <h1 className="text-4xl font-bold text-center text-bleu-fonce dark:text-bleu-clair mb-8">
            Galerie Média
          </h1>
          <div className="flex justify-center items-center min-h-[40vh]">
            <p className="text-center text-gray-500">
              Aucun média disponible pour le moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto pt-20 px-4">
        <h1 className="text-4xl font-bold text-center text-bleu-fonce dark:text-bleu-clair mb-8">
          Galerie Média
        </h1>
        <div className="flex justify-center items-center">
          <div className="w-full">
            <ParallaxScroll media={media} />
          </div>
        </div>
      </div>
    </div>
  );
}
