import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partenaires | Estivales de Brou",
  description:
    "Découvrez les partenaires de l'Estivales de Brou. Ils sont tous des entreprises qui ont contribué à l'organisation de nos événements.",
  keywords:
    "partenaires, entreprises, estivales de brou, organisation, événements",
  openGraph: {
    title: "Partenaires | Estivales de Brou",
    description:
      "Découvrez les partenaires de l'Estivales de Brou. Ils sont tous des entreprises qui ont contribué à l'organisation de nos événements.",
    images: [
      {
        url: "/homepage/banner/estivale3.jpg",
        width: 1200,
        height: 630,
        alt: "Partenaires Estivales de Brou",
      },
    ],
  },
};

export { default } from "./partners";
