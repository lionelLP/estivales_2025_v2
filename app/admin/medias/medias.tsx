"use client";

import { ImageViewer } from "@/components/common/ImageViewer";
import { Heart, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
const DialogClose = DialogPrimitive.Close;
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/common/file-upload";

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
  const [formData, setFormData] = useState({
    title: "",
    type: "image",
    videoUrl: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleAddMedia = async () => {
    setLoading(true);
    setError(null);

    try {
      if (formData.type === "image") {
        if (images.length === 0) {
          setError("Veuillez sélectionner une image");
          return;
        }

        // Vérifier la taille des images (max 10 Mo)
        for (const image of images) {
          if (image.size > 10 * 1024 * 1024) {
            setError(
              `L'image ${image.name} est trop volumineuse. Maximum 10 Mo.`
            );
            return;
          }
        }

        // Envoyer l'image
        const formDataUpload = new FormData();
        images.forEach((file) => {
          formDataUpload.append("files", file);
        });

        console.log("Envoi de l'image...");
        const uploadResponse = await fetch("/api/upload/images", {
          method: "POST",
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          console.error("Erreur upload:", errorData);
          throw new Error(
            errorData.error || "Erreur lors de l'upload de l'image"
          );
        }

        const { files } = await uploadResponse.json();
        console.log("Fichiers uploadés:", files);

        // Pour chaque fichier uploadé, mettre à jour le titre
        for (const file of files) {
          await fetch(`/api/medias/${file.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: formData.title || file.name,
            }),
          });
        }
      } else if (formData.type === "video") {
        if (!formData.videoUrl) {
          setError("Veuillez entrer un lien YouTube");
          return;
        }

        // Vérifier que c'est bien un lien YouTube
        if (
          !formData.videoUrl.includes("youtube.com") &&
          !formData.videoUrl.includes("youtu.be")
        ) {
          setError("Veuillez entrer un lien YouTube valide");
          return;
        }

        // Créer un média vidéo
        console.log("Envoi de la vidéo YouTube:", {
          title: formData.title || "Vidéo YouTube",
          url: formData.videoUrl,
          type: "video/youtube",
        });

        try {
          const response = await fetch("/api/medias", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: formData.title || "Vidéo YouTube",
              url: formData.videoUrl,
              type: "video/youtube",
            }),
          });

          console.log("Statut de la réponse:", response.status);

          const responseData = await response.json();
          console.log("Réponse API:", responseData);

          if (!response.ok) {
            throw new Error(
              responseData.error ||
                responseData.details ||
                "Erreur lors de l'ajout de la vidéo"
            );
          }
        } catch (fetchError) {
          console.error("Erreur lors de la requête fetch:", fetchError);
          throw fetchError;
        }
      }

      // Rafraîchir la liste des médias
      const response = await fetch("/api/medias");
      if (response.ok) {
        const data = await response.json();
        setMedias(data);
      }

      // Réinitialiser le formulaire
      setFormData({
        title: "",
        type: "image",
        videoUrl: "",
      });
      setImages([]);

      // Fermer le dialogue (nous utilisons un clic programmé sur le bouton de fermeture)
      const closeButton = document.querySelector(
        "[data-dialog-close]"
      ) as HTMLButtonElement;
      if (closeButton) closeButton.click();
    } catch (error) {
      console.error("Erreur lors de l'ajout du média:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'ajout du média"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredMedias =
    filter === "all" ? medias : medias.filter((media) => media.is_favorite);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-center">Médias</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Ajouter un média
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau média</DialogTitle>
            </DialogHeader>
            <Tabs
              defaultValue="image"
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="image">Image</TabsTrigger>
                <TabsTrigger value="video">Vidéo YouTube</TabsTrigger>
              </TabsList>
              <TabsContent value="image" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre (optionnel)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Titre de l'image"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Télécharger une image</Label>
                  <FileUpload
                    onChange={setImages}
                    initialFiles={images}
                    multiple={false}
                    accept="image/*"
                    id="upload-media-image"
                  />
                  <p className="text-xs text-gray-500">
                    Formats supportés: JPG, JPEG, PNG, GIF, etc. Max 10 Mo.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="video" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="video-title">Titre (optionnel)</Label>
                  <Input
                    id="video-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Titre de la vidéo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video-url">Lien YouTube</Label>
                  <Input
                    id="video-url"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, videoUrl: e.target.value })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </TabsContent>
            </Tabs>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <DialogClose asChild data-dialog-close>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button
                onClick={handleAddMedia}
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                {loading ? "Chargement..." : "Ajouter"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
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
