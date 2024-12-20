import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ajouter un Partenaire | Estivales de Brou",
  description:
    "Interface d'administration pour l'ajout de nouveaux partenaires aux Estivales de Brou",
  robots: {
    index: false,
    follow: false,
  },
};

export { default } from "./create";
