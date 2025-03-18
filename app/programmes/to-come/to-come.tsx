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
  const [filterCriteria, setFilterCriteria] = useState({
    location: "Tous",
    category: "Tous",
  });

  useEffect(() => {
    const loadingId = registerLoadingComponent();

    const fetchevents = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          console.log("Données brutes des événements:", data);

          // Filtrer les événements futurs
          const now = new Date();
          const futureEvents = data.filter((event: Event) => {
            const eventDate = new Date(event.event_date);
            return eventDate > now;
          });

          console.log("Événements futurs:", futureEvents);

          // Stocker tous les événements pour les filtrer plus tard
          setAllEvents(futureEvents);
          setFilteredEvents(futureEvents);

          if (futureEvents.length === 0) {
            setevents([]);
            return;
          }

          // Extraire les lieux uniques des événements
          const locations: string[] = futureEvents
            .map((event: Event) => {
              console.log("Location d'un événement:", event.location);
              return event.location;
            })
            .filter(
              (location: string | undefined): location is string => !!location
            );

          console.log("Locations extraites:", locations);

          // Dédupliquer les lieux
          const uniqueLocationsSet = [...new Set(locations)];
          console.log("Locations uniques:", uniqueLocationsSet);
          setUniqueLocations(uniqueLocationsSet);

          // Formatage initial des événements pour la timeline
          formatEventsForTimeline(futureEvents);

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

  // Fonction pour filtrer les événements selon les critères
  useEffect(() => {
    if (allEvents.length === 0) return;

    console.log("Filtrage avec critères:", filterCriteria);
    console.log("Recherche:", searchQuery);

    let filtered = [...allEvents];

    // Filtrer par lieu si un lieu spécifique est sélectionné
    if (filterCriteria.location !== "Tous") {
      filtered = filtered.filter(
        (event) => event.location === filterCriteria.location
      );
    }

    // Ajouter d'autres critères de filtrage ici si nécessaire

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
    formatEventsForTimeline(filtered);
  }, [allEvents, filterCriteria, searchQuery]);

  // Fonction pour formater les événements pour la timeline
  const formatEventsForTimeline = (eventsToFormat: Event[]) => {
    if (eventsToFormat.length === 0) {
      setevents([]);
      return;
    }

    // Grouper les événements par date
    const eventsByDate = eventsToFormat.reduce(
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
        return dateA.getTime() - dateB.getTime();
      });

    setevents(timelineData);
  };

  // Ajouter un log pour vérifier uniqueLocations à chaque rendu
  console.log("uniqueLocations lors du rendu:", uniqueLocations);

  // Gestionnaires pour la recherche et le filtrage
  const handleSearch = (query: string) => {
    console.log("Recherche toCome:", query);
    setSearchQuery(query);
  };

  const handleFilter = (filters: { location: string; category: string }) => {
    console.log("Filtres toCome:", filters);
    setFilterCriteria(filters);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (events.length === 0 && !error) {
    return (
      <div className="text-center text-gray-500">Aucun événement à venir</div>
    );
  }

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
