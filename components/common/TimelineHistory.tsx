"use client";

import { Timeline } from "@/components/ui/timeline";
import { Event } from "@/lib/types/event";
import { useEffect, useMemo, useState } from "react";
import { EventDetailModal } from "./EventDetailModal";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface TimelineHistoryProps {
  searchQuery?: string;
  filterCriteria?: {
    location: string;
    dateRange?: {
      from: Date | undefined;
      to: Date | undefined;
    };
  };
}

export function TimelineHistory({
  searchQuery = "",
  filterCriteria = {
    location: "Tous",
    dateRange: { from: undefined, to: undefined },
  },
}: TimelineHistoryProps) {
  const [events, setEvents] = useState<TimelineEntry[]>([]);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  // Récupérer les événements depuis l'API
  useEffect(() => {
    const fetchevents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();

          // Filtrer les événements futurs et publics
          const now = new Date();
          const futurePublicEvents = data.filter((event: Event) => {
            const eventDate = new Date(event.event_date);
            return eventDate > now && event.is_public;
          });

          if (futurePublicEvents.length === 0) {
            setAllEvents([]);
            setFilteredEvents([]);
            setEvents([]);
            return;
          }

          setAllEvents(futurePublicEvents);
          setFilteredEvents(futurePublicEvents);
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

  // Effet pour appliquer les filtres
  useEffect(() => {
    if (allEvents.length === 0) return;

    setIsFiltering(true);

    let filtered = [...allEvents];

    // Filtrer par lieu si un lieu spécifique est sélectionné
    if (filterCriteria.location !== "Tous") {
      filtered = filtered.filter(
        (event) => event.location === filterCriteria.location
      );
    }

    // Filtrer par plage de dates si définie
    if (filterCriteria.dateRange?.from) {
      const fromDate = new Date(filterCriteria.dateRange.from);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.event_date);
        return eventDate >= fromDate;
      });
    }

    if (filterCriteria.dateRange?.to) {
      const toDate = new Date(filterCriteria.dateRange.to);
      // Ajouter un jour pour inclure les événements du dernier jour
      toDate.setDate(toDate.getDate() + 1);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.event_date);
        return eventDate < toDate;
      });
    }

    // Filtrer par texte de recherche si disponible
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.subtitle?.toLowerCase().includes(query) ||
          false ||
          event.description?.toLowerCase().includes(query) ||
          false
      );
    }

    setFilteredEvents(filtered);

    // Petit délai pour garantir que l'animation se fait correctement
    setTimeout(() => {
      setIsFiltering(false);
    }, 100);
  }, [allEvents, filterCriteria, searchQuery]);

  // Formater les événements pour la timeline avec useMemo pour éviter les calculs inutiles
  useMemo(() => {
    if (filteredEvents.length === 0) {
      setEvents([]);
      return;
    }

    // Grouper les événements par date
    const eventsByDate = filteredEvents.reduce(
      (acc: { [key: string]: Event[] }, event: Event) => {
        const date = new Date(event.event_date).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
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
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-1">
                    {new Date(event.event_date).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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

    setEvents(timelineData);
  }, [filteredEvents]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        {isFiltering
          ? "Filtrage en cours..."
          : "Aucun événement ne correspond aux critères de recherche"}
      </div>
    );
  }

  return (
    <div className="w-full">
      {isFiltering ? (
        <div className="text-center py-4 text-blue-500">
          Mise à jour des résultats...
        </div>
      ) : (
        <Timeline key={`timeline-${filteredEvents.length}`} data={events} />
      )}
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
