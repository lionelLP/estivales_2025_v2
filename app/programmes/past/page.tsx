import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programmes passés | Estivales de Brou",
  description: "Liste des événements passés des Estivales de Brou",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Créer un Événement | Estivales de Brou",
    description: "Création d'un nouvel événement pour les Estivales de Brou",
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

export { default } from "./past";
