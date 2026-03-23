"use client";

import { Timeline } from "@/components/ui/timeline";
import { Event } from "@/lib/types/event";
import { useEffect, useMemo, useState } from "react";
import { EventDetailModal } from "./EventDetailModal";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
  sortDate: Date;
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
            if (!event.is_public) return false;
            
            const dates: Date[] = Array.isArray(event.event_dates) && event.event_dates.length > 0
              ? event.event_dates.map((d: { id: number; date_time: string }) => new Date(d.date_time))
              : event.event_date
              ? [new Date(event.event_date)]
              : [];

            return dates.some((d) => d > now);
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
    const getEventDates = (event: Event): Date[] => {
      const dates: Date[] = Array.isArray(event.event_dates) && event.event_dates.length > 0
        ? event.event_dates.map((d: { id: number; date_time: string }) => new Date(d.date_time))
        : event.event_date
        ? [new Date(event.event_date)]
        : [];
      return dates.filter((d) => !isNaN(d.getTime()));
    };

    if (filterCriteria.dateRange?.from) {
      const fromDate = new Date(filterCriteria.dateRange.from);
      filtered = filtered.filter((event) => {
        const dates = getEventDates(event);
        return dates.length > 0 && dates.some((d) => d >= fromDate);
      });
    }

    if (filterCriteria.dateRange?.to) {
      const toDate = new Date(filterCriteria.dateRange.to);
      // Ajouter un jour pour inclure les événements du dernier jour
      toDate.setDate(toDate.getDate() + 1);
      filtered = filtered.filter((event) => {
        const dates = getEventDates(event);
        return dates.length > 0 && dates.some((d) => d < toDate);
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

  // Formater les événements pour la timeline
  useEffect(() => {
    if (filteredEvents.length === 0) {
      setEvents([]);
      return;
    }

    // Expansion avec filtrage de dates si nécessaire
    const now = new Date();
    const fromDate = filterCriteria.dateRange?.from;
    const toDate = filterCriteria.dateRange?.to ? (() => { const d = new Date(filterCriteria.dateRange.to); d.setDate(d.getDate() + 1); return d; })() : undefined;

    const expandedEvents: Array<{ event: Event; date: Date }> = [];

    filteredEvents.forEach((event) => {
      if (event.event_dates && Array.isArray(event.event_dates) && event.event_dates.length > 0) {
        event.event_dates.forEach((dateObj: any) => {
          const dateTime = new Date(dateObj.date_time);
          if (dateTime > now) {
            const inRange = (!fromDate || dateTime >= fromDate) && (!toDate || dateTime < toDate);
            if (inRange) {
              expandedEvents.push({ event, date: dateTime });
            }
          }
        });
      } else {
        const dateTime = new Date(event.event_date);
        if (dateTime > now) {
          const inRange = (!fromDate || dateTime >= fromDate) && (!toDate || dateTime < toDate);
          if (inRange) {
            expandedEvents.push({ event, date: dateTime });
          }
        }
      }
    });

    // Trier par date et limiter à 5 prochaines séances
    expandedEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    const next5Sessions = expandedEvents.slice(0, 5);

    // Grouper par date
    const eventsByDateMap = new Map<string, { items: Array<{event: Event, date: Date}>; sortDate: Date }>();
    next5Sessions.forEach((item) => {
      const dateKey = item.date.toLocaleDateString("fr-FR", {
        timeZone: "UTC",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!eventsByDateMap.has(dateKey)) {
        eventsByDateMap.set(dateKey, { items: [], sortDate: item.date });
      }
      eventsByDateMap.get(dateKey)!.items.push(item);
    });

    // Transformer en format Timeline
    const timelineData = Array.from(eventsByDateMap.entries())
      .map(([date, { items, sortDate }]) => ({
        title: date,
        sortDate,
        content: (
          <div>
            <div className="mb-8">
              {items.map(({ event, date: eventTime }) => {
                const hasValidTime = !isNaN(eventTime.getTime());
                return (
                  <div key={event.id} className="mb-4">
                    <h3 className="text-neutral-800 dark:text-neutral-200 text-sm font-semibold">
                      {event.title}
                    </h3>
                    {event.subtitle && (
                      <p className="text-neutral-700 dark:text-neutral-300 text-xs">
                        {event.subtitle}
                      </p>
                    )}
                    {hasValidTime && (
                      <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-1">
                        {eventTime.toLocaleTimeString("fr-FR", {
                          timeZone: "UTC",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
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
                );
              })}
            </div>
          </div>
        ),
      }))
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

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
