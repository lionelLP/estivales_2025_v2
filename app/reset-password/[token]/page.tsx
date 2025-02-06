import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialisation de mot de passe | Estivales de Brou",
  description:
    "Réinitialisation de votre mot de passe pour les Estivales de Brou",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Réinitialisation de mot de passe | Estivales de Brou",
    description:
      "Réinitialisation de votre mot de passe pour les Estivales de Brou",
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

export { default } from "./reset-password";
