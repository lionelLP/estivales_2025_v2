import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales | Estivales de Brou",
  description: "Mentions légales des Estivales de Brou",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Mentions légales | Estivales de Brou",
    description: "Mentions légales des Estivales de Brou",
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

export { default } from "./mentions-legales";
