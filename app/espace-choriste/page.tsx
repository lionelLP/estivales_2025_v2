import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Espace choriste | Estivales de Brou",
  description:
    "Accédez à l'espace choriste des Estivales de Brou pour retrouver vos informations et vos outils dédiés.",
  keywords:
    "espace choriste, espace membre, estivales de brou, choristes, accès",
  openGraph: {
    title: "Espace choriste | Estivales de Brou",
    description:
      "Accédez à l'espace choriste des Estivales de Brou pour retrouver vos informations et vos outils dédiés.",
    images: [
      {
        url: "/homepage/banner/estivale2.jpg",
        width: 1200,
        height: 630,
        alt: "Espace choriste Estivales de Brou",
      },
    ],
  },
};

export { default } from "./space";
