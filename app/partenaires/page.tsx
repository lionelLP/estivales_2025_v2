"use client";

import { Partner } from "@/lib/types/partner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Partenaires() {
  const [partenaires, setPartenaires] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPartenaires = async () => {
      console.log("Fetching partenaires...");
      try {
        const response = await fetch("/api/partenaires");
        console.log("Response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched data:", data);
          setPartenaires(data);
        } else {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          setError("Erreur lors de la récupération des partenaires");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Erreur lors de la récupération des partenaires");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartenaires();
  }, []);

  // Debug logs for render state
  console.log("Current state:", { isLoading, error, partenairesCount: partenaires.length });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center">Chargement des partenaires...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold text-center mb-12">Nos Partenaires</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partenaires.map((partenaire) => {
          console.log("Rendering partner:", partenaire.name);
          return (
            <div key={partenaire.id} className="max-w-xs w-full group/card mx-auto">
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
                                objectFit: 'cover'
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
                        <p className="font-normal text-sm text-gray-50 relative z-10 my-4 line-clamp-3 drop-shadow-md">
                          {partenaire.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                // If no website URL, render without link
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
                              objectFit: 'cover'
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
                      <p className="font-normal text-sm text-gray-50 relative z-10 my-4 line-clamp-3 drop-shadow-md">
                        {partenaire.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
