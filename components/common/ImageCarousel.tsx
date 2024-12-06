"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Media {
  id: number;
  url: string;
  title: string;
  is_favorite: boolean;
}

export default function ImageCarousel() {
  const [images, setImages] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFavoriteImages = async () => {
      try {
        const response = await fetch("/api/medias");
        if (response.ok) {
          const data = await response.json();
          const favoriteImages = data.filter(
            (media: Media) => media.is_favorite
          );
          setImages(favoriteImages);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des images favorites:", error);
      }
    };

    fetchFavoriteImages();
  }, []);

  const paginate = (direction: number) => {
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + direction;
      if (newIndex >= images.length) return 0;
      if (newIndex < 0) return images.length - 1;
      return newIndex;
    });
  };

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-[600px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative w-full h-full"
        >
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full p-3 transition-all duration-300 z-10 group"
            onClick={() => paginate(-1)}
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white rounded-full p-3 transition-all duration-300 z-10 group"
            onClick={() => paginate(1)}
            aria-label="Image suivante"
          >
            <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 
                  ${
                    index === currentIndex
                      ? "bg-red-brou scale-110 shadow-lg"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                aria-label={`Aller à l'image ${index + 1}`}
              >
                <span className="sr-only">Image {index + 1}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
