"use client";

import { FileUpload } from "@/components/common/file-upload";
import { Event } from "@/lib/types/event";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function EditEvent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    booking_link: "",
  });
  const [eventDates, setEventDates] = useState<string[]>([""]);
  const [brochure, setBrochure] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentBrochurePath, setCurrentBrochurePath] = useState("");

  // Unwrap params using React.use()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };

    resolveParams();
  }, [params]);

  const eventId = resolvedParams?.id;

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (response.ok) {
          const data = await response.json();
          const eventDate = new Date(data.event_date)
            .toISOString()
            .slice(0, 16);
          setFormData({ ...data, event_date: eventDate });
          setCurrentBrochurePath(data.brochure_path || "");
          
          // Récupérer les dates depuis Event_Date
          const datesResponse = await fetch(`/api/events/${eventId}/dates`);
          if (datesResponse.ok) {
            const datesData = await datesResponse.json();
            if (datesData.dates && datesData.dates.length > 0) {
              const formattedDates = datesData.dates.map((d: any) => 
                new Date(d.date_time).toISOString().slice(0, 16)
              );
              setEventDates(formattedDates);
            } else {
              setEventDates([eventDate]);
            }
          } else {
            setEventDates([eventDate]);
          }
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
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validDates = eventDates.filter(date => date.trim() !== "");
    if (validDates.length === 0) {
      setError("Vous devez ajouter au moins une date");
      return;
    }
    
    try {
      let brochurePath = currentBrochurePath;
      if (brochure.length > 0) {
        const formDataBrochure = new FormData();
        formDataBrochure.append("file", brochure[0]);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formDataBrochure,
        });

        if (uploadResponse.ok) {
          const { path } = await uploadResponse.json();
          brochurePath = path;
        }
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          event_dates: validDates,
          brochure_path: brochurePath,
        }),
      });

      if (response.ok) {
        if (images.length > 0) {
          const imagesFormData = new FormData();
          images.forEach((file) => {
            imagesFormData.append("files", file);
          });
          imagesFormData.append("eventId", eventId || "");

          await fetch("/api/upload/images", {
            method: "POST",
            body: imagesFormData,
          });
        }

        router.push("/admin/events");
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

        {/* Dates de l'événement */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Dates de l&apos;événement
          </label>
          <div className="space-y-2">
            {eventDates.map((date, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => {
                    const newDates = [...eventDates];
                    newDates[index] = e.target.value;
                    setEventDates(newDates);
                  }}
                  className="flex-1 rounded-lg border p-2"
                  required={index === 0}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newDates = eventDates.filter((_, i) => i !== index);
                    setEventDates(newDates.length === 0 ? [""] : newDates);
                  }}
                  disabled={eventDates.length === 1}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setEventDates([...eventDates, ""])}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Ajouter une date
          </button>
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

        {/* Upload Brochure */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Brochure (PDF)</label>
          <FileUpload
            id="event-brochure-upload"
            onChange={(files) => setBrochure(files)}
            maxFiles={1}
            accept=".pdf"
          />
          {currentBrochurePath && (
            <p className="text-sm text-gray-500">
              Brochure actuelle : {currentBrochurePath}
            </p>
          )}
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
            onClick={() => router.push("/admin/events")}
            className="flex-1 bg-gray-200 text-neutral-900 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
