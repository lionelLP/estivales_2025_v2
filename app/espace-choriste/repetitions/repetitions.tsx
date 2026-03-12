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

const emptyForm = {
    title: "",
    type: "atelier1",
    location: "",
    description: "",
};

export default function ChoristesRepetitionsPage() {
    const {user, isLoading} = useAuth();
    const router = useRouter();

    const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /** modales et formulaire */
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedRehearsal, setSelectedRehearsal] = useState<Rehearsal | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (isLoading) return;
        if (!user) router.replace("/login");
        if (user?.userType !== 1) router.replace("/unauthorized");
    }, [isLoading, user, router]);

    const fetchRehearsals = async () => {
        try {
            const res = await fetch("/api/rehearsals", {credentials: "include", cache: "no-store"});
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
        if (user?.userType === 1) fetchRehearsals();
    }, [user]);

    const events = rehearsals.map(rep => ({
        title: `${rep.title} (${rep.type})`,
        start: new Date(rep.date),
        end: new Date(rep.date),
        resource: rep
    }));

    const handleSelectSlot = (slotInfo: any) => {
        setSelectedDate(slotInfo.start);
        setFormData(emptyForm);
        setFormError(null);
        setFormSuccess(null);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleChange = (e: any) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleSelectEvent = (event: any) => setSelectedRehearsal(event.resource);

    const closeEdit = () => {
        setSelectedRehearsal(null);
        setIsModalOpen(false);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        if (!formData.title) {
            setFormError("Le titre est obligatoire.");
            return;
        }

        try {
            const method = isEditing ? "PUT" : "POST";
            const body: any = {
                ...formData,
                date: selectedDate,
                ...(isEditing && selectedRehearsal ? {id: selectedRehearsal.id} : {})
            };

            const res = await fetch("/api/rehearsals", {
                method,
                headers: {"Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error((await res.json()).message || "Impossible d'enregistrer");

            setFormSuccess(isEditing ? "Répétition modifiée" : "Répétition ajoutée");
            await fetchRehearsals();

            setTimeout(() => {
                setIsModalOpen(false);
                setIsEditing(false);
                setFormData(emptyForm);
                if (isEditing) setSelectedRehearsal(null);
            }, 500);

        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Erreur inconnue");
        }
    };

    return (
        <div className="container mx-auto px-4 py-10 mt-5">
            <h1 className="text-4xl font-bold text-center mb-8 text-red-brou">Répétitions</h1>

            {error && <p className="text-red-500 text-center mb-6">{error}</p>}

            <div className="bg-white p-6 rounded-xl shadow border h-[650px] dark:bg-neutral-800">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    style={{height: "100%"}}
                />
            </div>

            {/* MODALE CREATION / EDITION */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeEdit}/>
                    <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-900">
                        <h2 className="text-xl font-semibold mb-4">{isEditing ? "Modifier la répétition" : "Ajouter une répétition"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="title" placeholder="Titre" value={formData.title} onChange={handleChange}
                                   className="w-full border rounded p-2"/>
                            <select name="type" value={formData.type} onChange={handleChange}
                                    className="w-full border rounded p-2">
                                <option value="atelier1">Atelier vocal 1</option>
                                <option value="atelier2">Atelier vocal 2</option>
                            </select>
                            <input name="location" placeholder="Lieu" value={formData.location} onChange={handleChange}
                                   className="w-full border rounded p-2"/>
                            <textarea name="description" placeholder="Description" value={formData.description}
                                      onChange={handleChange} className="w-full border rounded p-2"/>
                            {formError && <p className="text-red-500 text-sm">{formError}</p>}
                            {formSuccess && <p className="text-green-600 text-sm">{formSuccess}</p>}

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => {
                                    setIsModalOpen(false);
                                    setIsEditing(false);
                                }} className="px-4 py-2 border rounded">Annuler
                                </button>
                                <button type="submit"
                                        className="px-4 py-2 bg-red-brou text-white rounded">{isEditing ? "Mettre à jour" : "Ajouter"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODALE VUE */}
            {selectedRehearsal && !isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeEdit}/>
                    <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-neutral-900">
                        <h2 className="text-xl font-semibold mb-4">{selectedRehearsal.title}</h2>
                        <p><strong>Atelier :</strong> {selectedRehearsal.type}</p>
                        <p><strong>Date :</strong> {new Date(selectedRehearsal.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })}</p>
                        {selectedRehearsal.location && <p><strong>Lieu :</strong> {selectedRehearsal.location}</p>}
                        {selectedRehearsal.description &&
                            <p><strong>Description :</strong> {selectedRehearsal.description}</p>}
                        <div className="flex justify-between pt-5">
                            <div className="flex justify-start gap-3">
                                <button type="button" onClick={() => {
                                    setFormData({
                                        title: selectedRehearsal.title,
                                        type: selectedRehearsal.type,
                                        location: selectedRehearsal.location || "",
                                        description: selectedRehearsal.description || "",
                                    });
                                    setSelectedDate(new Date(selectedRehearsal.date));
                                    setIsEditing(true);
                                    setIsModalOpen(true);
                                }} className="px-4 py-2 bg-red-brou text-white rounded">Modifier
                                </button>
                                <button type="button" onClick={async () => {
                                    if (!confirm("Supprimer cette répétition ?")) return;
                                    try {
                                        const res = await fetch(`/api/rehearsals?id=${selectedRehearsal.id}`, {
                                            method: "DELETE",
                                            credentials: "include"
                                        });
                                        if (!res.ok) throw new Error((await res.json()).message || "Impossible de supprimer");
                                        await fetchRehearsals();
                                        setSelectedRehearsal(null);
                                    } catch (err) {
                                        alert(err instanceof Error ? err.message : "Erreur inconnue");
                                    }
                                }} className="px-4 py-2 text-red-600 hover:text-red-800 rounded">Supprimer
                                </button>
                            </div>
                            <button type="button" onClick={() => setSelectedRehearsal(null)}
                                    className="px-4 py-2 border rounded">Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}