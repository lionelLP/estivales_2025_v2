import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Événement | Estivales de Brou",
  description: "Détails de l'événement des Estivales de Brou",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Événement | Estivales de Brou",
    description: "Détails de l'événement des Estivales de Brou",
    images: [
      {
        url: "/homepage/banner/estivale2.jpg",
        width: 1200,
        height: 630,
        alt: "Création d'événement Estivales de Brou",
      },
    ],
  },
};

export { default } from "./event";
