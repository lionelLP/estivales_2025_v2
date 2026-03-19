"use client";

import { useEffect, useState } from "react";
import { Event } from "@/lib/types/event";
import { Calendar, MapPin, Info, Clock } from "lucide-react";

export default function SpectaclesChoriste() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch("/api/events");
                if (response.ok) {
                    const data = await response.json();
                    // Filter out private events if needed, but usually choristes should see them if they are for them
                    setEvents(data);
                } else {
                    setError("Erreur lors de la récupération des spectacles");
                }
            } catch (err) {
                console.error("Error fetching events:", err);
                setError("Erreur lors de la récupération des spectacles");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-brou"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="mb-10 mt-6 space-y-3">
                <h1 className="text-4xl font-bold text-center pt-8 mb-8 text-red-brou">
                    Spectacles
                </h1>
                <p className="text-neutral-600 text-center max-w-2xl mx-auto">
                    Retrouvez ici la liste des prochains spectacles et les consignes particulières (tenue, horaires de rendez-vous, etc.) pour chaque événement.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-8 text-center" role="alert">
                    {error}
                </div>
            )}

            {events.length === 0 && !error ? (
                <div className="text-center py-20 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                    <Calendar className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                    <p className="text-neutral-500">Aucun spectacle n&apos;est programmé pour le moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-bold text-neutral-900">{event.title}</h2>
                                        {event.subtitle && (
                                            <p className="text-lg text-red-brou/80 font-medium">{event.subtitle}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div className="flex items-center text-neutral-600">
                                            <Calendar className="h-5 w-5 mr-3 text-red-brou" />
                                            <span>
                                                {new Date(event.first_date || event.event_date).toLocaleDateString("fr-FR", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center text-neutral-600">
                                                <MapPin className="h-5 w-5 mr-3 text-red-brou" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {event.description && (
                                        <div className="pt-4 text-neutral-600 leading-relaxed border-t border-neutral-100">
                                            {event.description}
                                        </div>
                                    )}

                                    {event.instructions && (
                                        <div className="pt-6 border-t border-neutral-100 mt-4">
                                            <div className="bg-amber-50 rounded-xl border border-amber-100 p-6">
                                                <div className="flex items-center text-amber-800 font-bold mb-2">
                                                    <Info className="h-5 w-5 mr-2" />
                                                    Consignes Choristes
                                                </div>
                                                <div className="text-amber-900 text-sm whitespace-pre-wrap leading-relaxed italic">
                                                    {event.instructions}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!event.instructions && (
                                        <div className="pt-4 text-neutral-400 italic text-sm flex items-center border-t border-neutral-100 mt-4">
                                            <Clock className="h-4 w-4 mr-2 opacity-50" />
                                            Pas de consignes spécifiques pour ce spectacle.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
