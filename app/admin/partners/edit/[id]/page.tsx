import { Metadata } from "next";
import EditPartner from "./edit";

export const metadata: Metadata = {
  title: "Modifier un Partenaire | Estivales de Brou",
  description:
    "Interface d'administration pour la modification des informations d'un partenaire",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <EditPartner params={resolvedParams} />;
}
