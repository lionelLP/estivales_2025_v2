"use client";

import { FileUpload } from "@/components/common/file-upload";
import { useState } from "react";

export default function CreerEvenement() {
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "User",
    userType: "Administrateur",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Upload de la brochure si elle existe
      let brochurePath = null;
      if (brochure.length > 0) {
        const formData = new FormData();
        formData.append("file", brochure[0]);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const { path } = await uploadResponse.json();
          brochurePath = path;
        }
      }

      // Création de l'événement
      const eventResponse = await fetch("/api/evenements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          brochure_path: brochurePath,
        }),
      });

      if (eventResponse.ok) {
        const eventData = await eventResponse.json();
        const eventId = eventData.result.insertId;

        // Upload des images si elles existent
        if (images.length > 0) {
          const imagesFormData = new FormData();
          images.forEach((file) => {
            imagesFormData.append("files", file);
          });
          imagesFormData.append("eventId", eventId);

          await fetch("/api/upload/images", {
            method: "POST",
            body: imagesFormData,
          });
        }

        window.location.href = "/evenements";
      }
    } catch (error) {
      console.error("Erreur:", error);
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
