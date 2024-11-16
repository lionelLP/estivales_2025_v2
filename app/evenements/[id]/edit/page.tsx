"use client";

import { Event } from "@/lib/types/event";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditEvent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<Event>({
    title: "",
    subtitle: "",
    description: "",
    event_date: "",
    location: "",
    max_participants: 0,
    is_public: true,
    user_id: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/evenements/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          // Formatage de la date pour l'input datetime-local
          const eventDate = new Date(data.event_date)
            .toISOString()
            .slice(0, 16);
          setFormData({ ...data, event_date: eventDate });
        } else {
          setError("Événement non trouvé");
        }
      } catch {
        setError("Erreur lors de la récupération de l'événement");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/evenements/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/evenements");
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la mise à jour");
      }
    } catch {
      setError("Erreur lors de la mise à jour");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Modifier l&apos;événement</h1>

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
            value={formData.subtitle || ""}
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
            value={formData.description || ""}
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
            value={formData.location || ""}
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
            value={formData.max_participants || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                max_participants: parseInt(e.target.value) || 0,
              })
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

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Mettre à jour
          </button>
          <button
            type="button"
            onClick={() => router.push("/evenements")}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
