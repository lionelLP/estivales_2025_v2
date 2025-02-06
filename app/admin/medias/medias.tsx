"use client";

import { ImageViewer } from "@/components/common/ImageViewer";
import { Heart, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Media {
  id: number;
  url: string;
  title: string;
  type: string;
  is_favorite: boolean;
}

export default function MediasPage() {
  const [medias, setMedias] = useState<Media[]>([]);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  useEffect(() => {
    const fetchMedias = async () => {
      try {
        const response = await fetch("/api/medias");
        if (response.ok) {
          const data = await response.json();
          setMedias(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des médias:", error);
      }
    };

    fetchMedias();
  }, []);

  const toggleFavorite = async (mediaId: number) => {
    try {
      const response = await fetch(`/api/medias/${mediaId}/favorite`, {
        method: "PUT",
      });

      if (response.ok) {
        setMedias(
          medias.map((media) =>
            media.id === mediaId
              ? { ...media, is_favorite: !media.is_favorite }
              : media
          )
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du favori:", error);
    }
  };

  const deleteMedia = async (mediaId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce média ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/medias/${mediaId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMedias(medias.filter((media) => media.id !== mediaId));
      } else {
        alert("Erreur lors de la suppression du média");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du média:", error);
      alert("Erreur lors de la suppression du média");
    }
  };

  const filteredMedias =
    filter === "all" ? medias : medias.filter((media) => media.is_favorite);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Médias</h1>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
        Ajouter des médias en favoris pour qu&apos;ils apparaissent dans le
        carrousel de la page d&apos;accueil
      </p>
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full ${
            filter === "all"
              ? "bg-pink-500 text-white"
              : "bg-gray-200  dark:text-dark-mode-2 hover:bg-gray-300"
          }`}
        >
          Tous les médias
        </button>
        <button
          onClick={() => setFilter("favorites")}
          className={`px-4 py-2 rounded-full ${
            filter === "favorites"
              ? "bg-pink-500 text-white "
              : "bg-gray-200 dark:text-dark-mode-2 hover:bg-gray-300"
          }`}
        >
          Favoris
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedias.map((media) => (
          <div key={media.id} className="relative group">
            <ImageViewer src={media.url} alt={media.title}>
              <div className="aspect-square relative rounded-lg overflow-hidden cursor-pointer">
                <Image
                  src={media.url}
                  alt={media.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(media.id);
                    }}
                    className="p-2 rounded-full bg-white/80 hover:bg-white transition-all"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        media.is_favorite
                          ? "fill-pink-500 text-pink-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMedia(media.id);
                    }}
                    className="p-2 rounded-full bg-white/80 hover:bg-white transition-all"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
            </ImageViewer>
            <p className="mt-2 text-sm text-center truncate">{media.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
