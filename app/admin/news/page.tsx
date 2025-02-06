import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actualités | Estivales de Brou",
  description: "Actualités des Estivales de Brou",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Actualités | Estivales de Brou",
    description: "Actualités des Estivales de Brou",
    images: [
      {
        url: "/homepage/banner/estivale2.jpg",
        width: 1200,
        height: 630,
        alt: "Actualités Estivales de Brou",
      },
    ],
  },
};

export { default } from "./news";
