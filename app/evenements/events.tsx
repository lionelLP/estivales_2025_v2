"use client";

import { Event } from "@/lib/types/event";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Evenements() {
  const [evenements, setEvenements] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvenements = async () => {
      try {
        const response = await fetch("/api/evenements");
        if (response.ok) {
          const data = await response.json();
          setEvenements(data);
        } else {
          setError("Erreur lors de la récupération des événements");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des événements:", error);
        setError("Erreur lors de la récupération des événements");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvenements();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Liste des événements</h1>
        <Link
          href="/admin/events/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Créer un événement
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evenements.map((event) => (
          <div
            key={event.id}
            className="border rounded-lg p-6 shadow-md hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            {event.subtitle && (
              <p className="text-gray-600 mb-2">{event.subtitle}</p>
            )}
            <p className="text-sm text-gray-500 mb-4">
              {new Date(event.event_date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {event.description && (
              <p className="mb-4 line-clamp-3">{event.description}</p>
            )}
            <div className="flex justify-between items-center text-sm">
              {event.max_participants && (
                <span className="text-gray-600">
                  {event.max_participants} participants max.
                </span>
              )}
              <span
                className={`px-2 py-1 rounded ${
                  event.is_public
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {event.is_public ? "Public" : "Privé"}
              </span>
            </div>
            <div className="flex justify-end mt-4">
              <Link
                href={`/evenements/${event.id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Modifier
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
