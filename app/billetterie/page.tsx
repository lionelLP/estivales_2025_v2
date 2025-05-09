import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billetterie | Estivales de Brou",
  description:
    "Réservez vos billets pour les Estivales de Brou et ne manquez pas nos événements.",
  keywords:
    "billetterie, Estivales de Brou, spectacles, événements, réservation, Bourg-en-Bresse",
  openGraph: {
    title: "Billetterie | Estivales de Brou",
    description:
      "Réservez vos billets pour les Estivales de Brou et ne manquez pas nos événements.",
    images: [
      {
        url: "/homepage/banner/estivale3.jpg",
        width: 1200,
        height: 630,
        alt: "Actualités Estivales de Brou",
      },
    ],
  },
};

export { default } from "./billetterie";
