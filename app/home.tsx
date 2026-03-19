"use client";

import ImageCarousel from "@/components/common/ImageCarousel";
import { TimelineHistory } from "@/components/common/TimelineHistory";
import { SearchFilterWrapper } from "@/components/events/search-filter-wrapper";
import { Event } from "@/lib/types/event";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchEventLocations = async () => {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();

          // Filtrer les événements futurs
          const now = new Date();
          const futureEvents = data.filter((event: Event) => {
            const dates: Date[] = Array.isArray(event.event_dates) && event.event_dates.length > 0
              ? event.event_dates.map((d: { id: number; date_time: string }) => new Date(d.date_time))
              : event.event_date
              ? [new Date(event.event_date)]
              : [];

            return dates.some((d) => d > now);
          });

          // Extraire les lieux uniques
          const locations: string[] = futureEvents
            .map((event: Event) => event.location)
            .filter(
              (location: string | undefined): location is string => !!location
            );

          // Dédupliquer les lieux
          setUniqueLocations([...new Set(locations)]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des lieux:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventLocations();
  }, []);

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

  return (
    <div className="min-h-screen dark:bg-dark-mode">
      <ImageCarousel />

      <div className="container mx-auto px-4 py-16 ">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Texte à gauche */}
            <div className="text-left col-span-2 ">
              <h1 className="text-4xl font-bold mb-8 text-bleu-fonce dark:text-bleu-clair">
                Les Estivales de Brou
              </h1>

              <div className="prose prose-lg dark:prose-invert">
                <p className="mb-6">
                  Les Estivales de Brou, c&apos;est l&apos;histoire d&apos;une
                  passion pour la musique et les arts lyriques qui anime notre
                  région depuis plus de 20 ans. Notre festival est devenu un
                  rendez-vous incontournable pour les amateurs d&apos;opéra et
                  de musique classique.
                </p>

                <p className="mb-6">
                  Notre mission est de promouvoir de jeunes artistes
                  professionnels talentueux tout en rendant l&apos;art lyrique
                  accessible à tous. Chaque été, nous transformons des lieux
                  historiques en scènes magiques où la musique prend vie.
                </p>

                <p>
                  Rejoignez-nous pour vivre des moments inoubliables et
                  découvrir la beauté de l&apos;art lyrique dans un cadre
                  exceptionnel.
                </p>
              </div>
            </div>

            {/* Image droite */}
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/homepage/description.jpg"
                alt="Scène de concert"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-bleu-fonce dark:text-bleu-clair">
          Actualités
        </h2>
        <div className="mb-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
              <span className="ml-2 text-lg">Chargement des filtres...</span>
            </div>
          ) : (
            <SearchFilterWrapper
              mode="toCome"
              onSearchCallback={handleSearch}
              onFilterCallback={handleFilter}
              locations={uniqueLocations}
            />
          )}
        </div>

        <TimelineHistory
          searchQuery={searchQuery}
          filterCriteria={filterCriteria}
        />
      </div>
    </div>
  );
}
