import type { Metadata } from "next";
import Page from "./connexion";

export const metadata: Metadata = {
  title: "Connexion | Estivle de Brou",
};

export default function MetaPage() {
  return <Page />;
}
