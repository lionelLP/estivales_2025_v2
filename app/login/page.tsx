import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | Estivales de Brou",
  description:
    "Connectez-vous à votre espace personnel des Estivales de Brou. Accédez à votre profil artiste ou administrateur.",
  keywords:
    "connexion, login, espace membre, estivales de brou, compte utilisateur",
  robots: {
    index: false, // On ne veut pas que la page de connexion soit indexée
    follow: true,
  },
  openGraph: {
    title: "Connexion | Estivales de Brou",
    description: "Accédez à votre espace personnel des Estivales de Brou",
    images: [
      {
        url: "/homepage/banner/estivale2.jpg",
        width: 1200,
        height: 630,
        alt: "Connexion Estivales de Brou",
      },
    ],
  },
};

export { default } from "./login";
