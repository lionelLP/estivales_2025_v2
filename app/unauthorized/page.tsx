import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accès refusé | Estivales de Brou",
  description:
    "Vous n'avez pas les permissions nécessaires pour accéder à cette page",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Accès refusé | Estivales de Brou",
    description:
      "Vous n'avez pas les permissions nécessaires pour accéder à cette page",
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

export { default } from "./unauthorized";
