"use client";

import { Timeline } from "@/components/ui/timeline";
import { Event } from "@/lib/types/event";
import { useEffect, useState } from "react";
import { EventDetailModal } from "./EventDetailModal";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export function TimelineHistory() {
  const [events, setevents] = useState<TimelineEntry[]>([]);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchevents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          console.log("Données reçues:", data);

          // Filtrer les événements futurs et publics
          const now = new Date();
          const futurePublicEvents = data.filter((event: Event) => {
            const eventDate = new Date(event.event_date);
            return eventDate > now && event.is_public;
          });

          if (futurePublicEvents.length === 0) {
            setevents([]);
            return;
          }

          // Grouper les événements par date
          const eventsByDate = futurePublicEvents.reduce(
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
          const timelineData = Object.entries(eventsByDate)
            .map(([date, events]) => ({
              title: date,
              content: (
                <div>
                  <div className="mb-8">
                    {(events as Event[]).map((event: Event) => (
                      <div key={event.id} className="mb-4">
                        <h3 className="text-neutral-800 dark:text-neutral-200 text-sm font-semibold">
                          {event.title}
                        </h3>
                        {event.subtitle && (
                          <p className="text-neutral-700 dark:text-neutral-300 text-xs">
                            {event.subtitle}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsModalOpen(true);
                          }}
                          className="inline-block mt-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full text-sm font-medium hover:from-pink-600 hover:to-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Voir le détail
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            }))
            .sort((a, b) => {
              // Find the first event from each group to compare dates
              const eventsA = eventsByDate[a.title];
              const eventsB = eventsByDate[b.title];

              const dateA = new Date(eventsA[0].event_date);
              const dateB = new Date(eventsB[0].event_date);

              return dateA.getTime() - dateB.getTime();
            });

          setevents(timelineData);
        } else {
          setError("Erreur lors de la récupération des événements");
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des événements:", err);
        setError("Erreur lors de la récupération des événements");
      }
    };

    fetchevents();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center text-gray-500">Aucun événement à venir</div>
    );
  }

  return (
    <div className="w-full ">
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
  );
}
