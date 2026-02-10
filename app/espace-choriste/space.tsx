"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Calendar, FileText, Mail, Users } from "lucide-react";

type User = {
  userType: number;
} | null;

export default function EspaceChoriste() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.userType !== 1) {
      router.replace("/unauthorized");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-brou"></div>
      </div>
    );
  }

  if (!user || user.userType !== 1) {
    return null;
  }

  const choristeLinks = [
    {
      label: "Répétitions",
      href: "/espace-choriste/repetitions",
      icon: <Users className="h-12 w-12" />,
      description: "Calendrier, lieux, infos pratiques",
      color: "bg-red-brou",
    },
    {
      label: "Œuvres & partitions",
      href: "/espace-choriste/oeuvres",
      icon: <Calendar className="h-12 w-12" />,
      description: "Partitions et musiques de travail",
      color: "bg-blue-500",
    },
    {
      label: "Infos choristes",
      href: "/espace-choriste/infos",
      icon: <FileText className="h-12 w-12" />,
      description: "Contact Choriste, trombinoscope, documents",
      color: "bg-emerald-500",
    },
    {
      label: "Spectacles",
      href: "/espace-choriste/spectacles",
      icon: <Mail className="h-12 w-12" />,
      description: "Consignes pour les spectacles",
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 mt-6 space-y-3">
        <p className="text-xs uppercase tracking-widest text-neutral-500">
          Espace privé choristes
        </p>
        <h1 className="text-3xl font-bold text-neutral-900">
          Tableau de bord choristes
        </h1>
        <p className="text-sm text-neutral-600">
          Accès protégé par mot de passe, renouvelé en début de saison.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {choristeLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="group transform transition-all duration-300 hover:scale-105"
          >
            <div
              className={`${link.color} p-8 rounded-xl shadow-lg text-white h-full`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="transform transition-transform duration-300 group-hover:scale-110">
                  {link.icon}
                </div>
                <h2 className="text-2xl font-bold">{link.label}</h2>
                <p className="text-white/80">{link.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
