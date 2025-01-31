"use client";

import { useLoading } from "@/components/LoadingProvider";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Partner {
  id: number;
  name: string;
  description: string;
  website_url: string | null;
  logo_url: string;
  banner_url: string;
}

export default function Partenaires() {
  const [partenaires, setPartenaires] = useState<Partner[]>([]);
  const [error, setError] = useState("");
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(
    new Set()
  );
  const { registerLoadingComponent, componentLoaded } = useLoading();

  useEffect(() => {
    const loadingId = registerLoadingComponent();

    const fetchPartenaires = async () => {
      try {
        const response = await fetch("/api/partenaires");
        if (response.ok) {
          const data = await response.json();
          setPartenaires(data);
        } else {
          setError("Erreur lors de la récupération des partenaires");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Erreur lors de la récupération des partenaires");
      } finally {
        componentLoaded(loadingId);
      }
    };

    fetchPartenaires();

    return () => {
      componentLoaded(loadingId);
    };
  }, [componentLoaded, registerLoadingComponent]);

  const toggleDescription = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-center">Nos Partenaires</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partenaires.map((partenaire) => (
          <div
            key={partenaire.id}
            className="max-w-xs w-full group/card mx-auto relative"
          >
            {partenaire.website_url ? (
              <Link
                href={partenaire.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div
                  className={cn(
                    "cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl max-w-sm backgroundImage flex flex-col justify-between p-4",
                    "bg-cover hover:shadow-2xl transition-shadow duration-300"
                  )}
                  style={{ backgroundImage: `url(${partenaire.banner_url})` }}
                >
                  <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  <div className="flex flex-row items-center space-x-4 z-10">
                    <div className="relative h-16 w-16 flex-shrink-0">
                      <div className="absolute inset-0 bg-white rounded-full shadow-lg">
                        <div className="relative w-full h-full">
                          <Image
                            src={partenaire.logo_url}
                            alt={`Logo ${partenaire.name}`}
                            fill
                            sizes="64px"
                            className="object-cover p-[2px] rounded-full"
                            style={{
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <h2 className="font-bold text-xl text-gray-50 relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
                        {partenaire.name}
                      </h2>
                    </div>
                  </div>

                  <div className="text content">
                    {partenaire.description && (
                      <>
                        <p
                          className={cn(
                            "font-normal text-sm text-gray-50 relative z-10 my-4 drop-shadow-md",
                            !expandedDescriptions.has(partenaire.id)
                              ? "line-clamp-3"
                              : "max-h-48 overflow-y-auto"
                          )}
                        >
                          {partenaire.description}
                        </p>
                        {partenaire.description.length > 150 && (
                          <button
                            onClick={(e) => toggleDescription(partenaire.id, e)}
                            className="text-blue-300 hover:text-blue-400 text-sm font-medium relative z-10"
                          >
                            {expandedDescriptions.has(partenaire.id)
                              ? "Voir moins"
                              : "Voir plus"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <div
                className={cn(
                  "overflow-hidden relative card h-96 rounded-md shadow-xl max-w-sm backgroundImage flex flex-col justify-between p-4",
                  "bg-cover"
                )}
                style={{ backgroundImage: `url(${partenaire.banner_url})` }}
              >
                <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                <div className="flex flex-row items-center space-x-4 z-10">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <div className="absolute inset-0 bg-white rounded-full shadow-lg">
                      <div className="relative w-full h-full">
                        <Image
                          src={partenaire.logo_url}
                          alt={`Logo ${partenaire.name}`}
                          fill
                          sizes="64px"
                          className="object-cover p-[2px] rounded-full"
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-bold text-xl text-gray-50 relative z-10">
                      {partenaire.name}
                    </h2>
                  </div>
                </div>

                <div className="text content">
                  {partenaire.description && (
                    <>
                      <p
                        className={cn(
                          "font-normal text-sm text-gray-50 relative z-10 my-4 drop-shadow-md",
                          !expandedDescriptions.has(partenaire.id)
                            ? "line-clamp-3"
                            : "max-h-48 overflow-y-auto"
                        )}
                      >
                        {partenaire.description}
                      </p>
                      {partenaire.description.length > 150 && (
                        <button
                          onClick={(e) => toggleDescription(partenaire.id, e)}
                          className="text-blue-300 hover:text-blue-400 text-sm font-medium relative z-10"
                        >
                          {expandedDescriptions.has(partenaire.id)
                            ? "Voir moins"
                            : "Voir plus"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
