import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription - Les Estivales de Brou",
  description:
    "Créez votre compte pour rejoindre la communauté des Estivales de Brou. Accédez à votre espace artiste et partagez votre talent.",
  keywords:
    "inscription, création compte, artiste, estivales de brou, compte utilisateur",
  openGraph: {
    title: "Inscription - Les Estivales de Brou",
    description:
      "Rejoignez la communauté des Estivales de Brou en créant votre compte.",
    images: [
      {
        url: "/homepage/banner/estivale2.jpg",
        width: 1200,
        height: 630,
        alt: "Inscription Les Estivales de Brou",
      },
    ],
  },
};

export { default } from "./register";
