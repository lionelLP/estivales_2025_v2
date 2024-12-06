"use client";

import { Partner } from "@/lib/types/partner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Partenaires() {
  const router = useRouter();
  const [partenaires, setPartenaires] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

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

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      return;
    }

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/partenaires/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPartenaires((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Erreur lors de la suppression du partenaire");
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
      alert("Erreur lors de la suppression du partenaire");
    } finally {
      setIsDeleting(null);
    }
  };

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
      <div className="relative mb-12">
        <h1 className="text-3xl font-bold text-center">Nos Partenaires</h1>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <Link
            href="/partenaires/creer"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Ajouter un partenaire
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {partenaires.map((partenaire) => (
          <div key={partenaire.id} className="max-w-xs w-full group/card mx-auto relative">
            {/* Admin Controls */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                onClick={() => router.push(`/partenaires/${partenaire.id}/modifier`)}
                className="bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(partenaire.id)}
                disabled={isDeleting === partenaire.id}
                className="bg-white/90 hover:bg-white p-2 rounded-full transition-colors"
              >
                {isDeleting === partenaire.id ? (
                  <svg className="w-5 h-5 text-red-600 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>

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
        ))}
      </div>
    </div>
  );
}
