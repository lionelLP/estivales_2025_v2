import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Événements à venir | Estivales de Brou",
  description: "Liste des événements à venir des Estivales de Brou",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Événements à venir | Estivales de Brou",
    description: "Liste des événements à venir des Estivales de Brou",
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

export { default } from "./to-come";
