"use client";

import { useEffect, useState } from "react";

type Price = {
    category: string;
    barbier: { serie1: string; serie2: string };
    piano: string;
    requiem: string;
    tenors: string;
    pass: { serie1: string; serie2: string };
};

export default function BilletterieAdmin() {
    const [prices, setPrices] = useState<Price[]>([]);
    const [loading, setLoading] = useState(true);

    // Récupération des prix depuis l'API
    useEffect(() => {
        fetch("/api/billetterie")
            .then(res => res.json())
            .then((data: Price[]) => setPrices(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Fonction pour gérer les changements dans les inputs
    const handleChange = (
        index: number,
        field: keyof Price,
        value: string,
        subField?: "serie1" | "serie2"
    ) => {
        const updated = [...prices];

        if (subField) {
            // Champ avec serie1/serie2 (barbier, pass)
            const obj = updated[index][field] as { serie1: string; serie2: string };
            obj[subField] = value;
        } else {
            // Champ simple (piano, requiem, tenors)
            updated[index][field] = value as any;
        }

        setPrices(updated);
    };

    // Envoi des prix modifiés à l'API
    const handleSubmit = async () => {
        try {
            const res = await fetch("/api/billetterie", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(prices),
            });
            if (res.ok) alert("Prix mis à jour !");
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour des prix.");
        }
    };

    if (loading) return <p>Chargement des prix...</p>;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Gestion de la Billetterie</h1>

            {prices.map((row, i) => (
                <div key={i} className="mb-6 p-4 border rounded-lg">
                    <h2 className="font-bold mb-2">{row.category || "Entrée"}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {/* Barbier */}
                        <label>
                            Barbier 1° série
                            <input
                                className="border p-1 w-full"
                                value={row.barbier.serie1}
                                onChange={e => handleChange(i, "barbier", e.target.value, "serie1")}
                            />
                        </label>
                        <label>
                            Barbier 2° série
                            <input
                                className="border p-1 w-full"
                                value={row.barbier.serie2}
                                onChange={e => handleChange(i, "barbier", e.target.value, "serie2")}
                            />
                        </label>

                        {/* Piano */}
                        <label>
                            Piano
                            <input
                                className="border p-1 w-full"
                                value={row.piano}
                                onChange={e => handleChange(i, "piano", e.target.value)}
                            />
                        </label>

                        {/* Requiem */}
                        <label>
                            Requiem
                            <input
                                className="border p-1 w-full"
                                value={row.requiem}
                                onChange={e => handleChange(i, "requiem", e.target.value)}
                            />
                        </label>

                        {/* Trois ténors */}
                        <label>
                            Trois ténors
                            <input
                                className="border p-1 w-full"
                                value={row.tenors}
                                onChange={e => handleChange(i, "tenors", e.target.value)}
                            />
                        </label>

                        {/* Pass */}
                        <label>
                            Pass 1° série
                            <input
                                className="border p-1 w-full"
                                value={row.pass.serie1}
                                onChange={e => handleChange(i, "pass", e.target.value, "serie1")}
                            />
                        </label>
                        <label>
                            Pass 2° série
                            <input
                                className="border p-1 w-full"
                                value={row.pass.serie2}
                                onChange={e => handleChange(i, "pass", e.target.value, "serie2")}
                            />
                        </label>
                    </div>
                </div>
            ))}

            <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleSubmit}
            >
                Enregistrer les prix
            </button>
        </div>
    );
}
