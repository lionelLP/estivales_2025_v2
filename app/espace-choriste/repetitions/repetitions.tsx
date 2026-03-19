"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/contexts/AuthContext";

import {Calendar, momentLocalizer} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

type Rehearsal = {
    id: number;
    title: string;
    type: "atelier1" | "atelier2";
    date: string;
    location?: string;
    description?: string;
};

export default function ChoristesRepetitionsPage() {
    const {user, isLoading} = useAuth();
    const router = useRouter();

    const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRehearsal, setSelectedRehearsal] = useState<Rehearsal | null>(null);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState("month");

    useEffect(() => {
        if (isLoading) return;
        if (!user) router.replace("/login");
    }, [isLoading, user, router]);

    const fetchRehearsals = async () => {
        try {
            const res = await fetch("/api/rehearsals", {
                credentials: "include",
                cache: "no-store"
            });
            if (!res.ok) throw new Error((await res.json()).message || "Erreur lors du chargement");
            const data = await res.json();
            setRehearsals(data.rehearsals || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inconnue");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchRehearsals();
    }, [user]);

    const events = rehearsals.map(rep => ({
        title: `${rep.title}`,
        start: new Date(rep.date),
        end: new Date(rep.date),
        resource: rep
    }));

    const handleSelectEvent = (event: any) => {
        setSelectedRehearsal(event.resource);
    };

    return (
        <div className="container mx-auto px-4 py-10 mt-5">
            <h1 className="text-4xl font-bold text-center mb-8 text-red-brou">
                Répétitions
            </h1>

            {error && (
                <p className="text-red-500 text-center mb-6">{error}</p>
            )}

            <div className="bg-white p-6 rounded-xl shadow border h-[650px] dark:text-neutral-800">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    onSelectEvent={handleSelectEvent}
                    style={{height: "100%"}}
                    date={date}
                    onNavigate={(newDate: any) => setDate(newDate)}
                    views={["month"]}
                    onView={(newView: any) => setView(newView)}
                    eventPropGetter={(event: any) => {
                        const type = event.resource.type;

                        let backgroundColor = "";
                        let color = "white";

                        if (type === "atelier1") {
                            backgroundColor = "#ED057B";
                        } else if (type === "atelier2") {
                            backgroundColor = "#3fab54";
                        }

                        return {
                            style: {
                                backgroundColor,
                                color,
                                borderRadius: "6px",
                                border: "none",
                                cursor: "pointer"
                            }
                        };
                    }}
                />
            </div>

            {/* MODALE VUE */}
            {selectedRehearsal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSelectedRehearsal(null)}
                    />

                    <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-900">
                        <h2 className="text-xl font-semibold mb-4">
                            {selectedRehearsal.title}
                        </h2>

                        <p className={selectedRehearsal.type == "atelier1" ? 'text-red-brou' : 'text-green-500'}>
                            <strong>Atelier :</strong> {selectedRehearsal.type}
                        </p>

                        <p>
                            <strong>Date :</strong>{" "}
                            {new Date(selectedRehearsal.date).toLocaleDateString(
                                "fr-FR",
                                {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                }
                            )}
                        </p>

                        {selectedRehearsal.location && (
                            <p>
                                <strong>Lieu :</strong> {selectedRehearsal.location}
                            </p>
                        )}

                        {selectedRehearsal.description && (
                            <p>
                                <strong>Description :</strong>{" "}
                                {selectedRehearsal.description}
                            </p>
                        )}

                        <div className="flex justify-end pt-5">
                            <button
                                onClick={() => setSelectedRehearsal(null)}
                                className="px-4 py-2 border rounded"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}