import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil | Estivales de Brou",
  description: "Profil de l'utilisateur des Estivales de Brou",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Profil | Estivales de Brou",
    description: "Profil de l'utilisateur des Estivales de Brou",
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

export { default } from "./profile";
