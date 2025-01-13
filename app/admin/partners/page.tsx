import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Partenaires | Estivales de Brou",
  description:
    "Découvrez les partenaires qui soutiennent les Estivales de Brou. Institutions, entreprises et mécènes qui contribuent à la réussite de notre festival.",
  keywords:
    "partenaires, mécènes, sponsors, soutiens, estivales de brou, partenariats culturels",
  openGraph: {
    title: "Nos Partenaires | Estivales de Brou",
    description:
      "Les institutions et entreprises qui soutiennent le festival des Estivales de Brou",
    images: [
      {
        url: "/homepage/banner/estivale2.jpg",
        width: 1200,
        height: 630,
        alt: "Partenaires des Estivales de Brou",
      },
    ],
  },
};

export { default } from "./partner";
