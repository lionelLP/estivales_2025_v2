"use client";

import { Timeline } from "@/components/ui/timeline";
import Image from "next/image";

export function TimelineHistory() {
  const data = [
    {
      title: "2024",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Cette année, les Estivales de Brou présentent une programmation
            exceptionnelle mettant en vedette de jeunes talents lyriques
            prometteurs.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/images/timeline/2024-1.jpg"
              alt="Concert 2024"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-timeline"
            />
            <Image
              src="/images/timeline/2024-2.jpg"
              alt="Répétition 2024"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-timeline"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2020-2023",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8">
            Malgré les défis de la pandémie, les Estivales ont su s&apos;adapter
            et maintenir leur engagement envers l&apos;art lyrique, proposant
            des formats innovants et des expériences musicales uniques.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/images/timeline/2023-1.jpg"
              alt="Concert en plein air"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-timeline"
            />
            <Image
              src="/images/timeline/2023-2.jpg"
              alt="Performance 2023"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-timeline"
            />
          </div>
        </div>
      ),
    },
    {
      title: "2000-2019",
      content: (
        <div>
          <p className="text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-4">
            Les moments clés qui ont façonné notre histoire :
          </p>
          <div className="mb-8">
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
              ✨ Création des Estivales de Brou
            </div>
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
              🎭 Premiers spectacles lyriques
            </div>
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
              🌟 Développement des masterclasses
            </div>
            <div className="flex gap-2 items-center text-neutral-700 dark:text-neutral-300 text-xs md:text-sm">
              🎼 Création du festival jeunes talents
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="/images/timeline/history-1.jpg"
              alt="Archives 2000"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-timeline"
            />
            <Image
              src="/images/timeline/history-2.jpg"
              alt="Archives 2010"
              width={500}
              height={500}
              className="rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-timeline"
            />
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className="w-full">
      <Timeline data={data} />
    </div>
  );
}
