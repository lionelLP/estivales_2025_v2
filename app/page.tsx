import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Les Estivales de Brou - Festival de Musique Lyrique",
  description:
    "Festival de musique lyrique promouvant de jeunes artistes professionnels. Découvrez nos événements, concerts et performances dans des lieux historiques exceptionnels.",
  keywords:
    "estivales de brou, festival lyrique, musique classique, opéra, concerts, artistes",
  openGraph: {
    title: "Les Estivales de Brou - Festival de Musique Lyrique",
    description:
      "Festival de musique lyrique promouvant de jeunes artistes professionnels.",
    images: [
      {
        url: "/homepage/banner/estivale1.jpg",
        width: 1200,
        height: 630,
        alt: "Les Estivales de Brou",
      },
    ],
  },
};

export { default } from "./home";
