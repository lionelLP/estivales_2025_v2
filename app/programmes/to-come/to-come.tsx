"use client";

import { EventDetailModal } from "@/components/common/EventDetailModal";
import { FiltreEvenement } from "@/components/events/filtre-evenement";
import { RechercheEvenement } from "@/components/events/recherche-evenement";
import { Timeline } from "@/components/ui/timeline";
import { useLoading } from "@/contexts/LoadingContext";
import { Event } from "@/lib/types/event";
import { useEffect, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export default function ProgrammesToCome() {
  const [events, setevents] = useState<TimelineEntry[]>([]);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { registerLoadingComponent, componentLoaded } = useLoading();
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  // filteredEvents est utilisé dans le flux de données et pour la cohérence du code
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCriteria, setFilterCriteria] = useState<{
    location: string;
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
  }>({
    location: "Tous",
    dateRange: { from: undefined, to: undefined },
  });
  const [noEventsFound, setNoEventsFound] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    const loadingId = registerLoadingComponent();

    const fetchevents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();

          // Filtrer les événements futurs (vérifier toutes les dates)
          const now = new Date();
          const futureEvents = data.filter((event: Event) => {
            // Si l'événement a des dates dans Event_Date, vérifier si au moins une est future
            if (event.event_dates && Array.isArray(event.event_dates) && event.event_dates.length > 0) {
              return event.event_dates.some((dateObj: any) => new Date(dateObj.date_time) > now);
            }
            // Sinon vérifier event_date
            const eventDate = new Date(event.event_date);
            return eventDate > now;
          });

          // Stocker tous les événements pour les filtrer plus tard
          setAllEvents(futureEvents);
          setFilteredEvents(futureEvents);

          if (futureEvents.length === 0) {
            setevents([]);
            setNoEventsFound(true);
            componentLoaded(loadingId);
            return;
          }

          // Extraire les lieux uniques des événements
          const locations: string[] = futureEvents
            .map((event: Event) => event.location)
            .filter(
              (location: string | undefined): location is string => !!location
            );

          // Dédupliquer les lieux
          const uniqueLocationsSet = [...new Set(locations)];
          setUniqueLocations(uniqueLocationsSet);

          // Formatage initial des événements pour la timeline
          formatEventsForTimeline(futureEvents, undefined);
          setNoEventsFound(false);

          componentLoaded(loadingId);
        } else {
          setError("Erreur lors de la récupération des événements");
          componentLoaded(loadingId);
        }
      } catch (error) {
        console.error("Erreur:", error);
        setError("Erreur lors de la récupération des événements");
        componentLoaded(loadingId);
      }
    };

    fetchevents();
  }, []);

  // Effet pour appliquer les filtres
  useEffect(() => {
    if (allEvents.length === 0) return;

    setIsFiltering(
      searchQuery.trim() !== "" ||
      filterCriteria.location !== "Tous" ||
      filterCriteria.dateRange.from !== undefined ||
      filterCriteria.dateRange.to !== undefined
    );

    let filtered = [...allEvents];

    // Filtrer par lieu si un lieu spécifique est sélectionné
    if (filterCriteria.location !== "Tous") {
      filtered = filtered.filter(
        (event) => event.location === filterCriteria.location
      );
    }

    // Filtrer par plage de dates si définie (évaluer toutes les dates d'un événement)
    const getEventDates = (event: Event): Date[] => {
      const dates: Date[] = Array.isArray(event.event_dates) && event.event_dates.length > 0
        ? event.event_dates.map((d: { id: number; date_time: string }) => new Date(d.date_time))
        : event.event_date
        ? [new Date(event.event_date)]
        : [];
      return dates.filter((d) => !isNaN(d.getTime()));
    };

    if (filterCriteria.dateRange.from) {
      const fromDate = new Date(filterCriteria.dateRange.from);
      filtered = filtered.filter((event) => {
        const dates = getEventDates(event);
        return dates.length > 0 && dates.some((d) => d >= fromDate);
      });
    }

    if (filterCriteria.dateRange.to) {
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
          event.description?.toLowerCase().includes(query) ||
          event.images?.some((img) =>
            img.title.toLowerCase().includes(query)
          ) ||
          false
      );
    }

    setFilteredEvents(filtered);

    if (filtered.length === 0) {
      setNoEventsFound(true);
      setevents([]);
    } else {
      setNoEventsFound(false);
      formatEventsForTimeline(filtered, filterCriteria);
    }
  }, [allEvents, filterCriteria, searchQuery]);

  // Fonction pour formater les événements pour la timeline
  const formatEventsForTimeline = (eventsToFormat: Event[], dateFilter?: { location: string; dateRange: { from: Date | undefined; to: Date | undefined } }) => {
    if (eventsToFormat.length === 0) {
      setevents([]);
      return;
    }

    // Exploser chaque événement par ses dates (uniquement les dates futures)
    const expandedEvents: Array<{ event: Event; date: Date }> = [];
    const now = new Date();
    const fromDate = dateFilter?.dateRange?.from;
    const toDate = dateFilter?.dateRange?.to ? (() => { const d = new Date(dateFilter.dateRange.to); d.setDate(d.getDate() + 1); return d; })() : undefined;
    
    eventsToFormat.forEach((event) => {
      if (event.event_dates && Array.isArray(event.event_dates) && event.event_dates.length > 0) {
        // Si l'événement a des dates dans Event_Date, les utiliser (uniquement les futures)
        event.event_dates.forEach((dateObj: any) => {
          const dateTime = new Date(dateObj.date_time);
          if (dateTime > now) {
            // Appliquer le filtre de plage si défini
            const inRange = (!fromDate || dateTime >= fromDate) && (!toDate || dateTime < toDate);
            if (inRange) {
              expandedEvents.push({
                event,
                date: dateTime,
              });
            }
          }
        });
      } else {
        // Sinon utiliser event_date
        const dateTime = new Date(event.event_date);
        if (dateTime > now) {
          // Appliquer le filtre de plage si défini
          const inRange = (!fromDate || dateTime >= fromDate) && (!toDate || dateTime < toDate);
          if (inRange) {
            expandedEvents.push({
              event,
              date: dateTime,
            });
          }
        }
      }
    });

    // Grouper par date et garder une référence à la date réelle pour le tri
    const eventsByDateMap = new Map<string, { events: Event[]; sortDate: Date }>();
    
    expandedEvents.forEach((item) => {
      const dateKey = item.date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      
      if (!eventsByDateMap.has(dateKey)) {
        eventsByDateMap.set(dateKey, { events: [], sortDate: item.date });
      }
      eventsByDateMap.get(dateKey)!.events.push(item.event);
    });

    // Transformer en format Timeline
    const timelineData = Array.from(eventsByDateMap.entries())
      .map(([date, { events, sortDate }]) => ({
        title: date,
        sortDate,
        content: (
          <div>
            <div className="mb-8">
              {events.map((event: Event) => (
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
                    Voir les détails
                  </button>
                </div>
              ))}
            </div>
          </div>
        ),
      }))
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

    setevents(timelineData);
  };

  // Gestionnaires pour la recherche et le filtrage
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (filters: {
    location: string;
    dateRange: {
      from: Date | undefined;
      to: Date | undefined;
    };
  }) => {
    setFilterCriteria(filters);
  };

  // Message à afficher en fonction du contexte
  const renderNoEventsMessage = () => {
    if (isFiltering) {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 text-center shadow-md border border-pink-100 dark:border-pink-900 my-8">
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
            Aucun événement trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Aucun événement ne correspond à vos critères de recherche. Veuillez
            modifier vos filtres.
          </p>
        </div>
      );
    } else {
      return (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 text-center shadow-md border border-pink-100 dark:border-pink-900 my-8">
          <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">
            Aucun événement à venir
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Il n&apos;y a actuellement aucun événement programmé. Revenez
            bientôt pour découvrir nos prochains spectacles.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-left col-span-2">
              <h1 className="text-4xl font-bold mb-8 text-bleu-fonce dark:text-bleu-clair">
                Programmes à venir
              </h1>
            </div>
          </div>
          <div className="mb-8">
            <RechercheEvenement mode="toCome" onSearch={handleSearch} />
            <FiltreEvenement
              mode="toCome"
              onFilter={handleFilter}
              locations={uniqueLocations}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {error ? (
          <div className="text-red-500 bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800 my-4">
            {error}
          </div>
        ) : noEventsFound ? (
          renderNoEventsMessage()
        ) : (
          <Timeline data={events} />
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
    </div>
  );
}
