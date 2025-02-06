import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Événements | Estivales de Brou",
  description:
    "Interface d'administration pour la création d'un nouvel événement des Estivales de Brou",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Événements | Estivales de Brou",
    description: "Événements des Estivales de Brou",
    images: [
      {
        url: "/homepage/banner/estivale2.jpg",
        width: 1200,
        height: 630,
        alt: "Événements Estivales de Brou",
      },
    ],
  },
};

export { default } from "./event";
