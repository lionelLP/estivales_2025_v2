"use client";

import { Event } from "@/lib/types/event";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [event, setEvent] = useState<Event | null>(null);
  const [images, setImages] = useState<{ id: number; url: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const resolvedParams = await params;
        // Récupération des détails de l'événement
        const eventResponse = await fetch(`/api/events/${resolvedParams.id}`);
        if (!eventResponse.ok) {
          throw new Error("Erreur lors de la récupération de l'événement");
        }
        const eventData = await eventResponse.json();
        setEvent(eventData);

        // Récupération des images associées
        const imagesResponse = await fetch(
          `/api/events/${resolvedParams.id}/images`
        );
        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          setImages(imagesData);
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur lors de la récupération des données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [params]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4">
          <div className="text-red-500 text-center">
            {error || "Événement non trouvé"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* En-tête de l'événement */}
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            {event.subtitle && (
              <h2 className="text-xl text-gray-600 mb-4">{event.subtitle}</h2>
            )}

            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold mb-2">Date et heure</h3>
                <p>{new Date(event.event_date).toLocaleString("fr-FR")}</p>
              </div>
              {event.location && (
                <div>
                  <h3 className="font-semibold mb-2">Lieu</h3>
                  <p>{event.location}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <>
                <div className="mb-8">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="whitespace-pre-wrap">{event.description}</p>
                </div>
              </>
            )}

            {/* Informations complémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {event.max_participants && (
                <div>
                  <h3 className="font-semibold mb-2">Participants maximum</h3>
                  <p>{event.max_participants} personnes</p>
                </div>
              )}
              <div>
                <h3 className="font-semibold mb-2">Statut</h3>
                <p>
                  {event.is_public ? "Événement public" : "Événement privé"}
                </p>
              </div>
            </div>

            {/* Liens */}
            <div className="flex flex-wrap gap-4">
              {event.booking_link && (
                <a
                  href={event.booking_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Réserver
                </a>
              )}
              {event.brochure_path && (
                <a
                  href={event.brochure_path}
                  download={`brochure-${event.title}.pdf`}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = event.brochure_path || "";
                  }}
                >
                  Télécharger la brochure
                </a>
              )}
            </div>
          </div>

          {/* Galerie d'images */}
          {images.length > 0 && (
            <div className="border-t border-gray-200 p-8">
              <h3 className="font-semibold mb-4">Galerie photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative aspect-square">
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
