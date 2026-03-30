import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oeuvres choristes | Estivales de Brou",
  description:
    "Gestion des oeuvres et des ressources (partitions, musiques de travail) pour l'espace choriste.",
  robots: {
    index: false,
    follow: false,
  },
};

export { default } from "./oeuvres";
