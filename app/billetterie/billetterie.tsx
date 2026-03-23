"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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

export default function Billetterie() {
  const [data, setData] = useState<BilletterieData | null>(null);

  useEffect(() => {
    fetch("/api/billetterie")
        .then(res => res.json())
        .then((resData: BilletterieData) => setData(resData))
        .catch(err => console.error(err));
  }, []);

  if (!data) return <p>Chargement de la billetterie...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center pt-8 mb-8 text-red-brou">
        Billetterie
      </h1>

      {/* Images des fichiers PDF */}
      <div className="flex flex-col items-center gap-8 mb-8 max-w-2xl mx-auto">
        {data.images?.page1 && (
            <a
            href={data.images.pdf1 || data.images.page1}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-[3/4] w-full cursor-pointer transition-transform hover:scale-105 shadow-md"
            >
            <Image
                src={data.images.page1}
                alt="Programme page 1"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
            />
            </a>
        )}
        {data.images?.page2 && (
            <a
            href={data.images.pdf2 || data.images.page2}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-[3/4] w-full cursor-pointer transition-transform hover:scale-105 shadow-md"
            >
            <Image
                src={data.images.page2}
                alt="Programme page 2"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
            />
            </a>
        )}
      </div>

      {/* Tableau des tarifs (Dynamique parfait) */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white dark:bg-dark-mode border border-gray-300 dark:border-gray-700 shadow-lg">
          <thead>
            {/* Ligne des Spectacles */}
            <tr className="bg-red-brou text-white">
              <th className="py-3 px-4 border dark:border-gray-700 font-bold border-b-0"></th>
              {data.columns.map(col => (
                  <th
                    key={col.id}
                    colSpan={col.seriesCount}
                    className="py-3 px-4 border border-x-gray-300 dark:border-gray-700 text-center font-bold"
                  >
                    {col.name}
                  </th>
              ))}
            </tr>
            {/* Ligne des Séries (affichée uniquement là où c'est nécessaire) */}
            <tr className="bg-red-brou text-white/90">
              <th className="py-2 px-4 border dark:border-gray-700 bg-red-800 text-left w-48">Entrée</th>
              {data.columns.map(col => {
                  return Array.from({length: col.seriesCount}).map((_, i) => (
                      <th key={col.id + '_' + i} className="py-2 px-3 border dark:border-gray-700 text-center text-sm font-medium bg-red-800">
                          {col.seriesCount > 1 ? `${i+1}° Série` : ""}
                      </th>
                  ));
              })}
            </tr>
          </thead>
          <tbody className="dark:text-white">
            {data.rows.map((row, index) => (
              <tr
                key={row.id}
                className={
                  index % 2 === 0
                    ? "bg-gray-50 dark:bg-dark-mode-2"
                    : "bg-white dark:bg-dark-mode"
                }
              >
                <td className="py-3 px-4 border dark:border-gray-700 font-bold">
                  {row.category || "Entrée"}
                </td>
                {data.columns.map(col => {
                    const prices = row.prices[col.id] || [];
                    return Array.from({length: col.seriesCount}).map((_, i) => {
                        const val = prices[i] || "";
                        // Formatage automatique: on affiche l'euro si c'est un nombre valide, sinon on le laisse tel quel (ex: Gratuit)
                        const showEuro = val && !isNaN(Number(val));
                        
                        return (
                            <td key={col.id + '_' + i} className="py-3 px-3 border dark:border-gray-700 text-center text-lg">
                                {val}
                                {showEuro && <span className="text-gray-500 font-normal ml-1 text-sm">€</span>}
                            </td>
                        );
                    });
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Informations importantes */}
      <div className="space-y-6 mb-8">
        <div className="bg-gray-100 dark:bg-dark-mode-2 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-red-brou dark:text-red-400">
            Informations importantes
          </h2>
          <ul className="list-disc list-inside space-y-2 dark:text-white">
            {data.info.map((ligne, idx) => ligne.trim() ? <li key={idx}>{ligne}</li> : null)}
          </ul>
        </div>

        {/* Section Réservations */}
        {data.reservation && (
          <div className="bg-white dark:bg-dark-mode p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-brou dark:text-red-400">
              Réservations
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.reservation.telephone && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg dark:text-white">
                      {data.reservation.telephone.titre}
                    </h3>
                    <p className="dark:text-gray-300">{data.reservation.telephone.numero}</p>
                    <p className="text-sm dark:text-gray-400">
                      {data.reservation.telephone.horaires}
                    </p>
                  </div>
              )}

              {data.reservation.courrier && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg dark:text-white">
                      {data.reservation.courrier.titre}
                    </h3>
                    {data.reservation.courrier.lignes?.map((ligne: string, i: number) => (
                        <p key={i} className="dark:text-gray-300">{ligne}</p>
                    ))}
                  </div>
              )}

              {data.reservation.internet && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg dark:text-white">
                      {data.reservation.internet.titre}
                    </h3>
                    <div className="space-y-1">
                      {data.reservation.internet.liens?.map((lien: any, i: number) => (
                          <a
                            key={i}
                            href={lien.url}
                            className="text-red-brou dark:text-red-400 hover:underline block"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {lien.nom}
                          </a>
                      ))}
                    </div>
                  </div>
              )}

              {data.reservation.bureau && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg dark:text-white">
                      {data.reservation.bureau.titre}
                    </h3>
                    {data.reservation.bureau.lignes?.map((ligne: string, i: number) => (
                        <p key={i} className={i === data.reservation.bureau.lignes.length - 1 ? "text-sm dark:text-gray-400" : "dark:text-gray-300"}>
                            {ligne}
                        </p>
                    ))}
                  </div>
              )}
            </div>
          </div>
        )}

        {/* Notes importantes */}
        <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg border border-red-200 dark:border-red-900">
          <h2 className="text-xl font-bold mb-4 text-red-brou dark:text-red-400">
            Notes importantes
          </h2>
          <ul className="space-y-2 dark:text-gray-300">
            {data.notes.map((ligne, idx) => ligne.trim() ? <li key={idx} className="flex gap-2"><span className="text-red-400">•</span> {ligne}</li> : null)}
          </ul>
        </div>
      </div>
    </div>
  );
}
