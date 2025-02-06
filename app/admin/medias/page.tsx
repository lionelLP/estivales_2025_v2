import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gérer les médias | Estivales de Brou",
  description:
    "Interface d'administration pour la gestion des médias des Estivales de Brou",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Gérer les médias | Estivales de Brou",
    description: "Gestion des médias des Estivales de Brou",
    images: [
      {
        url: "/homepage/banner/estivale2.jpg",
        width: 1200,
        height: 630,
        alt: "Gestion des médias Estivales de Brou",
      },
    ],
  },
};

export { default } from "./medias";
