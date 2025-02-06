import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration | Estivales de Brou",
  description: "Interface d'administration pour les Estivales de Brou",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Administration | Estivales de Brou",
    description: "Administration des Estivales de Brou",
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

export { default } from "./homePage";
