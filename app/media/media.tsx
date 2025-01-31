"use client";

import { ParallaxScroll } from "@/components/ui/parallax-scroll";
import { useEffect, useState } from "react";
export default function MediaPage() {
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch("/api/media");
        if (response.ok) {
          const data = await response.json();
          setMedia(data);
        } else {
          setError("Erreur lors de la récupération des médias");
        }
      } catch (error) {
        console.error("Erreur:", error);
        setError("Erreur lors de la récupération des médias");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Chargement des médias...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto pt-20 px-4">
        <h1 className="text-4xl font-bold text-center text-bleu-fonce dark:text-bleu-clair">
          Galerie Média
        </h1>
        <div className="flex justify-center items-center">
          <div className="w-full">
            <ParallaxScroll media={media} />
          </div>
        </div>
      </div>
    </div>
  );
}
