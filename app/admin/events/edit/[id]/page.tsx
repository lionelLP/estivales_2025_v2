import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modifier un Événement | Estivales de Brou",
  description:
    "Interface d'administration pour la modification des informations d'un événement",
  robots: {
    index: false,
    follow: false,
  },
};

export { default } from "./edit";
