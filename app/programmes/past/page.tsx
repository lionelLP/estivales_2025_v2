"use client";

import { EventDetailModal } from "@/components/common/EventDetailModal";
import { Timeline } from "@/components/ui/timeline";
import { useLoading } from "@/contexts/LoadingContext";
import { Event } from "@/lib/types/event";
import { useEffect, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export default function ProgrammesPast() {
  const [events, setevents] = useState<TimelineEntry[]>([]);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { registerLoadingComponent, componentLoaded } = useLoading();

  useEffect(() => {
    const loadingId = registerLoadingComponent();

    const fetchevents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();

          // Filtrer les événements passés
          const now = new Date();
          const pastEvents = data.filter((event: Event) => {
            const eventDate = new Date(event.event_date);
            return eventDate <= now;
          });

          if (pastEvents.length === 0) {
            setevents([]);
            return;
          }

          // Grouper les événements par date
          const eventsByDate = pastEvents.reduce(
            (acc: { [key: string]: Event[] }, event: Event) => {
              const date = new Date(event.event_date).toLocaleDateString(
                "fr-FR",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              );
              if (!acc[date]) {
                acc[date] = [];
              }
              acc[date].push(event);
              return acc;
            },
            {}
          );

          // Transformer en format Timeline
          const timelineData: TimelineEntry[] = Object.entries<Event[]>(
            eventsByDate
          )
            .map(([date, dateEvents]) => ({
              title: date,
              content: (
                <div>
                  <div className="mb-8">
                    {dateEvents.map((event: Event) => (
                      <div key={event.id} className="mb-4">
                        <h3 className="text-neutral-800 dark:text-neutral-200 text-sm font-semibold">
                          {event.title}
                        </h3>
                        {event.subtitle && (
                          <p className="text-neutral-700 dark:text-neutral-300 text-xs">
                            {event.subtitle}
                          </p>
                        )}
                        <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-1">
                          {new Date(event.event_date).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                        <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-1">
                          {event.location}
                        </p>
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsModalOpen(true);
                          }}
                          className="inline-block mt-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full text-sm font-medium hover:from-pink-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Voir les détails
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            }))
            .sort((a, b) => {
              const dateA = new Date(eventsByDate[a.title][0].event_date);
              const dateB = new Date(eventsByDate[b.title][0].event_date);
              return dateB.getTime() - dateA.getTime(); // Tri inversé pour avoir les plus récents en premier
            });

          setevents(timelineData);
        } else {
          setError("Erreur lors de la récupération des événements");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des événements:", err);
        setError("Erreur lors de la récupération des événements");
      } finally {
        componentLoaded(loadingId);
      }
    };

    fetchevents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center text-gray-500">Aucun événement passé</div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-left col-span-2">
              <h1 className="text-4xl font-bold mb-8 text-bleu-fonce dark:text-bleu-clair">
                Programmes passés
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <Timeline data={events} />
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
