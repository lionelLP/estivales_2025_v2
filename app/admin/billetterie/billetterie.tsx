"use client";

import { useEffect, useState, useRef } from "react";
import { Trash2, Plus, Save, UploadCloud } from "lucide-react";

type Column = { id: string; name: string; seriesCount: number };
type Row = { id: string; category: string; prices: Record<string, string[]> };

type BilletterieData = {
    columns: Column[];
    rows: Row[];
    info: string[];
    reservation: any;
    notes: string[];
    images: { page1: string; page2: string; pdf1: string; pdf2: string };
};

export default function BilletterieAdmin() {
    const [data, setData] = useState<BilletterieData | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingMedia, setUploadingMedia] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/billetterie")
            .then(res => res.json())
            .then((resData: BilletterieData) => setData(resData))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleChangeContent = (field: keyof BilletterieData, value: any) => {
        if (!data) return;
        setData({ ...data, [field]: value });
    };

    const handleSave = async () => {
        if (!data) return;
        try {
            const res = await fetch("/api/billetterie", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (res.ok) alert("Billetterie mise à jour !");
            else alert("Erreur lors de la sauvegarde.");
        } catch (error) {
            console.error(error);
            alert("Erreur réseau lors de la mise à jour.");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof BilletterieData['images'], isPdf: boolean) => {
        if (!e.target.files?.length || !data) return;
        const file = e.target.files[0];
        setUploadingMedia(fieldName);

        const formData = new FormData();
        if (isPdf) {
            formData.append("file", file); // API expects 'file' for docs
        } else {
            formData.append("image", file); // API expects 'image' for images
        }
        
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });
            const result = await res.json();
            
            if (res.ok) {
                const url = result.url || result.path;
                handleChangeContent("images", { ...data.images, [fieldName]: url });
            } else {
                alert("Erreur d'upload: " + result.error);
            }
        } catch (err) {
            console.error(err);
            alert("Erreur réseau d'upload");
        } finally {
            setUploadingMedia(null);
            e.target.value = ''; // Reset input
        }
    };

    if (loading || !data) return <p>Chargement de l'administration...</p>;

    const addColumn = () => {
        const id = prompt("Identifiant court du spectacle (ex: opera) :");
        if (!id) return;
        const name = prompt("Titre du spectacle :");
        if (!name) return;
        const countStr = prompt("Nombre de séries pour ce spectacle (ex: 2) :", "1");
        const seriesCount = parseInt(countStr || "1", 10) || 1;

        const newCol = { id, name, seriesCount };
        const newRows = data.rows.map(r => ({
            ...r,
            prices: { ...r.prices, [id]: Array(seriesCount).fill("") }
        }));
        setData({ ...data, columns: [...data.columns, newCol], rows: newRows });
    };

    const removeColumn = (id: string) => {
        if (!confirm("Supprimer ce spectacle de la grille ?")) return;
        const newCols = data.columns.filter(c => c.id !== id);
        setData({ ...data, columns: newCols });
    };

    const updateSeriesCount = (colId: string, count: number) => {
        if (count < 1) count = 1;
        
        const cols = [...data.columns];
        const idx = cols.findIndex(c => c.id === colId);
        cols[idx].seriesCount = count;

        const newRows = data.rows.map(r => {
            const currentPrices = r.prices[colId] || [];
            const newPrices = Array(count).fill("").map((_, i) => currentPrices[i] || "");
            return { ...r, prices: { ...r.prices, [colId]: newPrices } };
        });

        setData({ ...data, columns: cols, rows: newRows });
    };

    const addRow = () => {
        const id = prompt("Identifiant interne de la catégorie (ex: abonne) :");
        if (!id) return;
        const category = prompt("Nom de la catégorie (ex: Abonné) :");
        if (!category) return;
        const prices: any = {};
        data.columns.forEach(c => { prices[c.id] = Array(c.seriesCount).fill(""); });
        setData({ ...data, rows: [...data.rows, { id, category, prices }] });
    };

    const removeRow = (id: string) => {
        if (!confirm("Supprimer cette catégorie de prix ?")) return;
        setData({ ...data, rows: data.rows.filter(r => r.id !== id) });
    };

    const handlePriceChange = (rowId: string, colId: string, index: number, val: string) => {
        // Enforce basic characters, strip € sign
        val = val.replace(/€/g, "").trim();
        const newRows = data.rows.map(r => {
            if (r.id === rowId) {
                const colPrices = [...(r.prices[colId] || [])];
                colPrices[index] = val;
                return {
                    ...r,
                    prices: {
                        ...r.prices,
                        [colId]: colPrices
                    }
                };
            }
            return r;
        });
        setData({ ...data, rows: newRows });
    };

    const handleTextListChange = (field: 'info' | 'notes', val: string) => {
        setData({ ...data, [field]: val.split('\\n') });
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gestion des Tarifs (Billetterie)</h1>
                <button onClick={handleSave} className="bg-red-brou text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-red-800 transition">
                    <Save size={20} /> Enregistrer
                </button>
            </div>

            <div className="bg-white dark:bg-dark-mode p-6 rounded-lg shadow-lg mb-8 border dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
                    Tableau des tarifs
                    <div className="flex gap-2">
                        <button onClick={addColumn} className="bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><Plus size={16}/> Spectacle</button>
                        <button onClick={addRow} className="bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"><Plus size={16}/> Catégorie</button>
                    </div>
                </h2>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                            <tr>
                                <th className="border p-2 bg-gray-100 dark:bg-dark-mode-2">Catégorie</th>
                                {data.columns.map(col => (
                                    <th key={col.id} className="border p-2 min-w-[200px]">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <input 
                                                    type="text" 
                                                    className="w-full font-bold bg-transparent border-b border-gray-300 focus:outline-none focus:border-red-500"
                                                    value={col.name}
                                                    onChange={e => {
                                                        const cols = [...data.columns];
                                                        const idx = cols.findIndex(c => c.id === col.id);
                                                        cols[idx].name = e.target.value;
                                                        setData({...data, columns: cols});
                                                    }}
                                                />
                                                <button onClick={() => removeColumn(col.id)} className="text-red-500 ml-2" title="Supprimer colonne" type="button"><Trash2 size={16}/></button>
                                            </div>
                                            <div className="text-xs font-normal flex items-center gap-2 justify-center">
                                                <span>Nb rubriques :</span>
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    max="5"
                                                    value={col.seriesCount}
                                                    className="w-12 border rounded text-center dark:bg-dark-mode-2 dark:border-gray-600"
                                                    onChange={e => updateSeriesCount(col.id, parseInt(e.target.value, 10))}
                                                />
                                            </div>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-dark-mode-2">
                                    <td className="border p-2 font-semibold min-w-[150px]">
                                        <div className="flex items-center gap-2">
                                            <input 
                                                value={row.category} 
                                                className="w-full bg-transparent border-b border-gray-300 focus:outline-none"
                                                onChange={e => {
                                                    const rows = [...data.rows];
                                                    const idx = rows.findIndex(r => r.id === row.id);
                                                    rows[idx].category = e.target.value;
                                                    setData({...data, rows});
                                                }}
                                            />
                                            <button onClick={() => removeRow(row.id)} className="text-red-500" title="Supprimer ligne"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                    {data.columns.map(col => {
                                        const prices = row.prices[col.id] || [];
                                        return (
                                            <td key={col.id} className="border p-2 align-top">
                                                <div className="flex flex-col gap-1">
                                                    {Array.from({length: col.seriesCount}).map((_, i) => (
                                                        <div key={i} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-dark-mode rounded border dark:border-gray-700 px-2 py-1">
                                                            <span className="text-gray-500 text-xs w-6">{i+1}°</span>
                                                            <div className="flex items-center gap-1 w-full relative">
                                                                <input 
                                                                    className="w-full bg-transparent text-right font-medium focus:outline-none pe-4"
                                                                    value={prices[i] || ""}
                                                                    placeholder="ex: 15 / Gratuit"
                                                                    onChange={e => handlePriceChange(row.id, col.id, i, e.target.value)}
                                                                />
                                                                <span className="text-gray-400 font-bold ml-1 absolute right-0">€</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Textes d'information */}
                <div className="bg-white dark:bg-dark-mode p-6 rounded-lg shadow-lg border dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Informations importantes</h2>
                    <p className="text-xs text-gray-500 mb-2">Une phrase par ligne. Ceci s'affiche en dessous du tableau.</p>
                    <textarea 
                        className="w-full min-h-[150px] border p-2 rounded dark:bg-dark-mode-2 dark:border-gray-600"
                        value={data.info.join('\n')}
                        onChange={e => handleTextListChange('info', e.target.value)}
                    />
                </div>

                <div className="bg-white dark:bg-dark-mode p-6 rounded-lg shadow-lg border dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4">Notes (Rouge)</h2>
                    <p className="text-xs text-gray-500 mb-2">Une phrase par ligne. S'affiche dans l'encadré rouge en bas.</p>
                    <textarea 
                        className="w-full min-h-[150px] border p-2 rounded dark:bg-dark-mode-2 dark:border-gray-600"
                        value={data.notes.join('\n')}
                        onChange={e => handleTextListChange('notes', e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-dark-mode p-6 rounded-lg shadow-lg mb-8 border dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Images & Dépliants <UploadCloud size={20} className="text-gray-400" />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Page 1 */}
                    <div className="space-y-4 border p-4 rounded bg-gray-50 dark:bg-dark-mode-2 border-gray-200 dark:border-gray-600">
                        <h3 className="font-bold flex items-center justify-between">Volet 1
                            {uploadingMedia?.includes('1') && <span className="text-xs text-blue-500 animate-pulse">Upload en cours...</span>}
                        </h3>
                        <label className="block">
                            <span className="text-sm font-semibold">Image d'aperçu</span>
                            <div className="flex gap-2 items-center mt-1">
                                <input type="text" className="w-full border p-2 rounded dark:bg-dark-mode dark:border-gray-600 text-sm" value={data.images.page1} onChange={e => handleChangeContent('images', {...data.images, page1: e.target.value})} />
                                <div className="relative overflow-hidden bg-blue-100 text-blue-700 px-3 py-2 rounded cursor-pointer whitespace-nowrap text-sm hover:bg-blue-200 transition">
                                    <span>Parcourir</span>
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'page1', false)} />
                                </div>
                            </div>
                        </label>
                        <label className="block">
                            <span className="text-sm font-semibold">Document PDF (au clic)</span>
                            <div className="flex gap-2 items-center mt-1">
                                <input type="text" className="w-full border p-2 rounded dark:bg-dark-mode dark:border-gray-600 text-sm" value={data.images.pdf1} onChange={e => handleChangeContent('images', {...data.images, pdf1: e.target.value})} />
                                <div className="relative overflow-hidden bg-blue-100 text-blue-700 px-3 py-2 rounded cursor-pointer whitespace-nowrap text-sm hover:bg-blue-200 transition">
                                    <span>Parcourir</span>
                                    <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'pdf1', true)} />
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Page 2 */}
                    <div className="space-y-4 border p-4 rounded bg-gray-50 dark:bg-dark-mode-2 border-gray-200 dark:border-gray-600">
                        <h3 className="font-bold flex items-center justify-between">Volet 2
                            {uploadingMedia?.includes('2') && <span className="text-xs text-blue-500 animate-pulse">Upload en cours...</span>}
                        </h3>
                        <label className="block">
                            <span className="text-sm font-semibold">Image d'aperçu</span>
                            <div className="flex gap-2 items-center mt-1">
                                <input type="text" className="w-full border p-2 rounded dark:bg-dark-mode dark:border-gray-600 text-sm" value={data.images.page2} onChange={e => handleChangeContent('images', {...data.images, page2: e.target.value})} />
                                <div className="relative overflow-hidden bg-blue-100 text-blue-700 px-3 py-2 rounded cursor-pointer whitespace-nowrap text-sm hover:bg-blue-200 transition">
                                    <span>Parcourir</span>
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'page2', false)} />
                                </div>
                            </div>
                        </label>
                        <label className="block">
                            <span className="text-sm font-semibold">Document PDF (au clic)</span>
                            <div className="flex gap-2 items-center mt-1">
                                <input type="text" className="w-full border p-2 rounded dark:bg-dark-mode dark:border-gray-600 text-sm" value={data.images.pdf2} onChange={e => handleChangeContent('images', {...data.images, pdf2: e.target.value})} />
                                <div className="relative overflow-hidden bg-blue-100 text-blue-700 px-3 py-2 rounded cursor-pointer whitespace-nowrap text-sm hover:bg-blue-200 transition">
                                    <span>Parcourir</span>
                                    <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'pdf2', true)} />
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            
            <div className="text-center mt-8">
                <button onClick={handleSave} className="bg-red-brou text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-red-800 transition shadow-lg">
                    Enregistrer les modifications
                </button>
            </div>
        </div>
    );
}
