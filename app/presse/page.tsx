import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revues de presse & actualités | Estivales de Brou",
  description:
    "Découvrez les dernières actualités, articles de presse et communiqués concernant les Estivales de Brou. Restez informé de nos événements et performances.",
  keywords:
    "presse, actualités, articles, revue de presse, estivales de brou, communiqués, médias",
  openGraph: {
    title: "Revues de presse & actualités | Estivales de Brou",
    description:
      "Suivez toute l'actualité des Estivales de Brou à travers notre revue de presse.",
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

export { default } from "./press";
