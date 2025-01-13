import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galerie Médias | Estivales de Brou",
  description:
    "Découvrez notre galerie de photos et vidéos des concerts, performances et moments forts des Estivales de Brou. Revivez les meilleurs instants de nos événements.",
  keywords:
    "galerie, photos, vidéos, concerts, performances, estivales de brou, événements culturels, musique lyrique",
  openGraph: {
    title: "Galerie Médias | Estivales de Brou",
    description:
      "Explorez les moments magiques des Estivales de Brou à travers notre galerie multimédia.",
    images: [
      {
        url: "/homepage/banner/estivale1.jpg",
        width: 1200,
        height: 630,
        alt: "Galerie Estivales de Brou",
      },
    ],
  },
};

export { default } from "./media";
