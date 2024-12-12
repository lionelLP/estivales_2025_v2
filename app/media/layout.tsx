import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galerie Média | Estivales de Brou",
  description:
    "Découvrez notre galerie de photos et vidéos des Estivales de Brou",
};

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
