"use client";
import { FileUpload } from "@/components/common/file-upload";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Suggestion {
  properties: {
    label: string;
    city: string;
    postcode: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    event_date: "",
    location: "",
    max_participants: "",
    is_public: true,
    booking_link: "",
  });
  const [brochure, setBrochure] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Upload de la brochure si elle existe
      let brochurePath = null;
      if (brochure.length > 0) {
        const formDataBrochure = new FormData();
        formDataBrochure.append("file", brochure[0]);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formDataBrochure,
        });

        if (!uploadResponse.ok) {
          throw new Error("Erreur lors de l'upload de la brochure");
        }

        const { path } = await uploadResponse.json();
        brochurePath = path;
        console.log("Brochure uploadée avec succès, chemin:", brochurePath);
      }

      // Création de l'événement avec le chemin de la brochure
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          brochure_path: brochurePath, // Utiliser directement le chemin de la brochure
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'événement");
      }

      const eventData = await response.json();
      const eventId = eventData.eventId;

      console.log("Événement créé avec ID:", eventId);

      // Upload des images si elles existent
      if (images.length > 0 && eventId) {
        const formDataImages = new FormData();
        images.forEach((file) => {
          formDataImages.append("files", file);
        });
        // Ajout de l'ID de l'événement
        formDataImages.append("eventId", eventId.toString());

        const uploadImagesResponse = await fetch("/api/upload/images", {
          method: "POST",
          body: formDataImages,
        });

        if (!uploadImagesResponse.ok) {
          console.error(
            "Erreur lors de l'upload des images, mais l'événement a été créé"
          );
        } else {
          console.log(
            "Images uploadées avec succès et associées à l'événement"
          );
        }
      }

      router.push("/admin/events");
    } catch (error) {
      console.error("Erreur:", error);
      setError("Erreur lors de la création de l'événement");
    }
  };

  const handleAddressSearch = async (query: string) => {
    setFormData({ ...formData, location: query });

    if (query.length > 2) {
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(
            query
          )}&limit=5`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Erreur lors de la recherche d'adresse:", error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddressSelect = (suggestion: Suggestion) => {
    setFormData({
      ...formData,
      location: suggestion.properties.label,
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Créer un nouvel événement</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {error && (
          <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>
        )}
        {/* Titre */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Titre
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        {/* Sous-titre */}
        <div className="space-y-2">
          <label htmlFor="subtitle" className="block text-sm font-medium">
            Sous-titre
          </label>
          <input
            id="subtitle"
            type="text"
            value={formData.subtitle}
            onChange={(e) =>
              setFormData({ ...formData, subtitle: e.target.value })
            }
            className="w-full rounded-lg border p-2"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full rounded-lg border p-2"
          />
        </div>

        {/* Date de l'événement */}
        <div className="space-y-2">
          <label htmlFor="event_date" className="block text-sm font-medium">
            Date de l&apos;événement
          </label>
          <input
            id="event_date"
            type="datetime-local"
            value={formData.event_date}
            onChange={(e) =>
              setFormData({ ...formData, event_date: e.target.value })
            }
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        {/* Lieu avec autocomplétion */}
        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium">
            Lieu
          </label>
          <div className="relative">
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleAddressSearch(e.target.value)}
              onFocus={() =>
                formData.location.length > 2 && setShowSuggestions(true)
              }
              placeholder="Entrez une adresse"
              className="w-full rounded-lg border p-2 bg-white dark:bg-neutral-950 shadow-sm focus:ring-2 focus:ring-blue-500 transition"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer"
                    onClick={() => handleAddressSelect(suggestion)}
                  >
                    <div className="font-medium">
                      {suggestion.properties.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {suggestion.properties.postcode}{" "}
                      {suggestion.properties.city}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nombre maximum de participants */}
        <div className="space-y-2">
          <label
            htmlFor="max_participants"
            className="block text-sm font-medium"
          >
            Nombre maximum de participants
          </label>
          <input
            id="max_participants"
            type="number"
            min="1"
            value={formData.max_participants}
            onChange={(e) =>
              setFormData({ ...formData, max_participants: e.target.value })
            }
            className="w-full rounded-lg border p-2"
          />
        </div>

        {/* Événement public */}
        <div className="flex items-center space-x-2">
          <input
            id="is_public"
            type="checkbox"
            checked={formData.is_public}
            onChange={(e) =>
              setFormData({ ...formData, is_public: e.target.checked })
            }
            className="rounded border-gray-300"
          />
          <label htmlFor="is_public" className="text-sm font-medium">
            Événement public
          </label>
        </div>

        {/* Lien de réservation */}
        <div className="space-y-2">
          <label htmlFor="booking_link" className="block text-sm font-medium">
            Lien de réservation
          </label>
          <input
            id="booking_link"
            type="url"
            value={formData.booking_link}
            onChange={(e) =>
              setFormData({ ...formData, booking_link: e.target.value })
            }
            placeholder="https://..."
            className="w-full rounded-lg border p-2"
          />
          <p className="text-sm text-gray-500">
            Lien vers votre système de réservation externe (optionnel)
          </p>
        </div>

        {/* Upload Brochure */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Brochure (PDF)</label>
          <FileUpload
            id="event-brochure-upload"
            onChange={(files) => setBrochure(files)}
            maxFiles={1}
            accept=".pdf"
          />
          <p className="text-sm text-gray-500">Un seul fichier PDF autorisé</p>
        </div>

        {/* Upload Images */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Images de l&apos;événement
          </label>
          <FileUpload
            id="event-images-upload"
            onChange={(files) => setImages(files)}
            maxFiles={200}
            accept="image/*"
          />
          <p className="text-sm text-gray-500">Jusqu&apos;à 200 images</p>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Créer l&apos;événement
        </button>
      </form>
    </div>
  );
}
