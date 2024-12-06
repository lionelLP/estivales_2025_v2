"use client";

import { FileUpload } from "@/components/common/file-upload";
import { useState } from "react";

export default function CreerEvenement() {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    event_date: "",
    location: "",
    max_participants: "",
    is_public: true,
  });
  const [brochure, setBrochure] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Brochure:", brochure);
    console.log("Images:", images);

    try {
      const response = await fetch("/api/evenements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Redirection vers la liste des événements après création
        window.location.href = "/evenements";
      } else {
        const data = await response.json();
        console.error("Erreur:", data.error);
        // Ici vous pourriez ajouter une notification d'erreur pour l'utilisateur
      }
    } catch (error) {
      console.error("Erreur:", error);
      // Ici vous pourriez ajouter une notification d'erreur pour l'utilisateur
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Créer un nouvel événement</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
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

        {/* Lieu */}
        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium">
            Lieu
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            className="w-full rounded-lg border p-2"
          />
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

        {/* Upload Brochure */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Brochure (PDF)</label>
          <FileUpload
            onChange={(files) => setBrochure(files)}
            maxFiles={1}
            accept=".pdf"
            multiple={false}
          />
          <p className="text-sm text-gray-500">Un seul fichier PDF autorisé</p>
        </div>

        {/* Upload Images */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Images de l&apos;événement
          </label>
          <FileUpload
            onChange={(files) => setImages(files)}
            maxFiles={200}
            accept="image/*"
            multiple={true}
          />
          <p className="text-sm text-gray-500">Jusqu'à 200 images</p>
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
