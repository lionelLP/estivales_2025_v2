import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un Utilisateur | Administration",
  description:
    "Interface d'administration pour la création de nouveaux utilisateurs",
  robots: {
    index: false,
    follow: false,
  },
};

export { default } from "./create";
