import { Metadata } from "next";

export const metadata: Metadata = {
  title: "À Propos | Estivales de Brou",
  description:
    "Découvrez l'histoire et la mission des Estivales de Brou, festival de musique lyrique engagé dans la promotion de jeunes artistes professionnels depuis plus de 20 ans.",
  keywords:
    "à propos, histoire, mission, estivales de brou, festival lyrique, association culturelle, musique classique",
  openGraph: {
    title: "À Propos | Estivales de Brou",
    description:
      "L'histoire et les valeurs qui animent les Estivales de Brou depuis plus de 20 ans",
    images: [
      {
        url: "/homepage/banner/estivale2.jpg",
        width: 1200,
        height: 630,
        alt: "Histoire des Estivales de Brou",
      },
    ],
  },
  alternates: {
    canonical: "https://estivalesdebrou.fr/about",
  },
};

export { default } from "./about";
