import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revues de presse & actualités | Estivales de Brou",
  description:
    "Découvrez les dernières actualités et articles de presse sur les Estivales de Brou",
};

export default function PresseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
