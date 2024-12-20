import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Estivales de Brou",
  description:
    "Contactez l'équipe des Estivales de Brou. Informations pratiques, formulaire de contact et coordonnées pour nous joindre.",
  keywords:
    "contact, estivales de brou, formulaire, informations pratiques, adresse, téléphone, email",
  openGraph: {
    title: "Contact | Estivales de Brou",
    description:
      "Besoin d'informations ? Contactez l'équipe des Estivales de Brou",
    images: [
      {
        url: "/homepage/banner/estivale3.jpg",
        width: 1200,
        height: 630,
        alt: "Contact Estivales de Brou",
      },
    ],
  },
  alternates: {
    canonical: "https://estivalesdebrou.fr/contact",
  },
};

export { default } from "./contact";
