"use client";

import Image from "next/image";

export default function Billetterie() {
  const tableData = [
    {
      category: "",
      barbier: { serie1: "39 €", serie2: "32 €" },
      piano: "29 €",
      requiem: "34 €",
      tenors: "27 €",
      pass: { serie1: "73 €", serie2: "66 €" },
    },
    {
      category: "Préférentiel",
      barbier: { serie1: "36 €", serie2: "29 €" },
      piano: "27 €",
      requiem: "31 €",
      tenors: "25 €",
      pass: { serie1: "67 €", serie2: "60 €" },
    },
    {
      category: "Jeunes",
      barbier: { serie1: "15 €", serie2: "10 €" },
      piano: "10 €",
      requiem: "12 €",
      tenors: "8 €",
      pass: { serie1: "27 €", serie2: "22 €" },
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-red-brou">
        Billetterie
      </h1>

      {/* Images des fichiers PDF */}
      <div className="flex flex-col items-center gap-8 mb-8 max-w-2xl mx-auto">
        <a
          href="/billetterie/programme_page1.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-[3/4] w-full cursor-pointer transition-transform hover:scale-105"
        >
          <Image
            src="/billetterie/programme_page1.png"
            alt="Programme page 1"
            fill
            className="object-contain"
          />
        </a>
        <a
          href="/billetterie/programme_page2.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-[3/4] w-full cursor-pointer transition-transform hover:scale-105"
        >
          <Image
            src="/billetterie/programme_page2.png"
            alt="Programme page 2"
            fill
            className="object-contain"
          />
        </a>
      </div>

      {/* Tableau des tarifs */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white dark:bg-dark-mode border border-gray-300 dark:border-gray-700 shadow-lg">
          <thead>
            <tr className="bg-red-brou text-white">
              <th className="py-3 px-4 border dark:border-gray-700"></th>
              <th
                colSpan={2}
                className="py-3 px-4 border dark:border-gray-700 text-center"
              >
                Le Barbier de Séville
              </th>
              <th className="py-3 px-4 border dark:border-gray-700 text-center">
                Cherche piano aqueux
              </th>
              <th className="py-3 px-4 border dark:border-gray-700 text-center">
                Requiem Fauré
              </th>
              <th className="py-3 px-4 border dark:border-gray-700 text-center">
                Trois ténors
              </th>
              <th
                colSpan={2}
                className="py-3 px-4 border dark:border-gray-700 text-center"
              >
                Pass&apos;Festival
              </th>
            </tr>
            <tr className="bg-red-100 dark:bg-red-900/30">
              <th className="py-2 px-4 border dark:border-gray-700">Entrée</th>
              <th className="py-2 px-4 border dark:border-gray-700 text-center">
                1° Série
              </th>
              <th className="py-2 px-4 border dark:border-gray-700 text-center">
                2° Série
              </th>
              <th className="py-2 px-4 border dark:border-gray-700 text-center"></th>
              <th className="py-2 px-4 border dark:border-gray-700 text-center"></th>
              <th className="py-2 px-4 border dark:border-gray-700 text-center"></th>
              <th className="py-2 px-4 border dark:border-gray-700 text-center">
                1° Série
              </th>
              <th className="py-2 px-4 border dark:border-gray-700 text-center">
                2° Série
              </th>
            </tr>
          </thead>
          <tbody className="dark:text-white">
            {tableData.map((row, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0
                    ? "bg-gray-50 dark:bg-dark-mode-2"
                    : "bg-white dark:bg-dark-mode"
                }
              >
                <td className="py-2 px-4 border dark:border-gray-700 font-semibold">
                  {row.category || "Entrée"}
                </td>
                <td className="py-2 px-4 border dark:border-gray-700 text-center">
                  {row.barbier.serie1}
                </td>
                <td className="py-2 px-4 border dark:border-gray-700 text-center">
                  {row.barbier.serie2}
                </td>
                <td className="py-2 px-4 border dark:border-gray-700 text-center">
                  {row.piano}
                </td>
                <td className="py-2 px-4 border dark:border-gray-700 text-center">
                  {row.requiem}
                </td>
                <td className="py-2 px-4 border dark:border-gray-700 text-center">
                  {row.tenors}
                </td>
                <td className="py-2 px-4 border dark:border-gray-700 text-center">
                  {row.pass.serie1}
                </td>
                <td className="py-2 px-4 border dark:border-gray-700 text-center">
                  {row.pass.serie2}
                </td>
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
            <li>
              « Chéquier Jeune 01 » et « Carte Pass région » acceptés pour la
              billetterie et le Pass&apos;Festival
            </li>
            <li>
              Tarif préférentiel : adhérents Estivales de Brou et JM France
            </li>
            <li>Groupes (dès 15 personnes)</li>
            <li>Tarif jeunes : moins de 20 ans</li>
            <li>Enfants gratuits jusqu&apos;à 12 ans</li>
            <li>Places non numérotées, sauf au théâtre</li>
            <li>
              Ouverture des portes ½ heure avant le début de chaque
              représentation
            </li>
          </ul>
        </div>

        {/* Section Réservations */}
        <div className="bg-white dark:bg-dark-mode p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-red-brou dark:text-red-400">
            Réservations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-lg dark:text-white">
                Par téléphone
              </h3>
              <p className="dark:text-gray-300">04 74 23 63 25</p>
              <p className="text-sm dark:text-gray-400">
                10h à 12h et 15h à 18h du mardi au vendredi
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg dark:text-white">
                Par courrier
              </h3>
              <p className="dark:text-gray-300">Estivales de Brou</p>
              <p className="dark:text-gray-300">13 avenue Alsace Lorraine</p>
              <p className="dark:text-gray-300">01000 Bourg en Bresse</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg dark:text-white">
                Par Internet
              </h3>
              <div className="space-y-1">
                <a
                  href="https://www.fnacspectacles.com/artist/les-estivales-de-brou/"
                  className="text-red-brou dark:text-red-400 hover:underline block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FNAC Spectacles
                </a>
                <a
                  href="https://www.francebillet.com/artist/les-estivales-de-brou/"
                  className="text-red-brou dark:text-red-400 hover:underline block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  France Billet
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-lg dark:text-white">
                Au bureau de location
              </h3>
              <p className="dark:text-gray-300">Cinéma Amphi de Bourg</p>
              <p className="dark:text-gray-300">
                Les mercredis et samedis de 15h à 18h
              </p>
              <p className="text-sm dark:text-gray-400">
                à partir du samedi 10 mai 2024
              </p>
            </div>
          </div>
        </div>

        {/* Notes importantes */}
        <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-lg border border-red-200 dark:border-red-900">
          <h2 className="text-xl font-bold mb-4 text-red-brou dark:text-red-400">
            Notes importantes
          </h2>
          <ul className="space-y-2 dark:text-gray-300">
            <li>
              Les places retenues par téléphone et non réglées dans la quinzaine
              seront remises en vente.
            </li>
            <li>Les billets ne seront plus expédiés à partir du 22 juin.</li>
            <li>
              Ils devront alors être retirés au guichet 20 minutes au plus tard
              avant le début du spectacle.
            </li>
            <li>En aucun cas les billets ne seront repris.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
