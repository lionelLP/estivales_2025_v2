"use client";

import { Event } from "@/lib/types/event";
import { Armchair, Download } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface EventDetailModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

interface Media {
  id: number;
  url: string;
  title: string;
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
}: EventDetailModalProps) {
  const [images, setImages] = useState<Media[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      if (event.id) {
        try {
          const response = await fetch(`/api/evenements/${event.id}/images`);
          if (response.ok) {
            const data = await response.json();
            setImages(data);
          }
        } catch (error) {
          console.error("Erreur lors du chargement des images:", error);
        }
      }
    };

    fetchImages();
  }, [event.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full p-6 relative">
        <div className="flex flex-col items-center relative">
          <div className="absolute left-0 flex items-center gap-1 text-gray-500">
            <Armchair className="w-5 h-5" />
            <span>{event.max_participants}</span>
          </div>
          <h2 className="text-2xl font-bold text-center">{event.title}</h2>
        </div>

        <p className="text-gray-600 mt-2 text-center">{event.subtitle}</p>

        {event.description && (
          <div className="mt-4">
            <p className="text-gray-800 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {new Date(event.event_date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
              })}{" "}
              –{" "}
              {new Date(event.event_date).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{event.location}</span>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {event.brochure_path ? (
            <a
              href={event.brochure_path}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-center py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Download className="w-5 h-5" />
              <span>Télécharger la brochure</span>
            </a>
          ) : null}

          {event.booking_link && (
            <a
              href={event.booking_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 transition text-center"
            >
              Réserver ma place
            </a>
          )}
        </div>

        {/* Galerie d'images */}
        {images.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Photos de l'événement</h3>
            <div className="grid grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square cursor-pointer"
                  onClick={() => setSelectedImage(image.url)}
                >
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    className="object-cover rounded-lg hover:opacity-90 transition"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal d'image en plein écran */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <Image
                src={selectedImage}
                alt="Image en plein écran"
                width={1200}
                height={800}
                className="object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
