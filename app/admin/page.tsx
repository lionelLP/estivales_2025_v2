"use client";

import UnauthorizedPage from "@/app/unauthorized/page";
import {
  FileText,
  Images,
  Newspaper,
  PartyPopper,
  UserPlus,
  Users,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (response.ok) {
          setCurrentUser(data);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const adminLinks = [
    {
      label: "Partenaires",
      href: "/admin/partners",
      icon: <Users className="h-12 w-12" />,
      description: "Gérer les partenaires de l'événement",
      color: "bg-blue-500",
    },
    {
      label: "À propos",
      href: "/admin/about",
      icon: <FileText className="h-12 w-12" />,
      description: "Modifier la page À propos",
      color: "bg-green-500",
    },
    {
      label: "Événements",
      href: "/admin/events",
      icon: <PartyPopper className="h-12 w-12" />,
      description: "Gérer les événements",
      color: "bg-purple-500",
    },
    {
      label: "Revue de presse",
      href: "/admin/news",
      icon: <Newspaper className="h-12 w-12" />,
      description: "Gérer les articles de presse",
      color: "bg-orange-500",
    },
    {
      label: "Gestion des médias",
      href: "/admin/medias",
      icon: <Images className="h-12 w-12" />,
      description: "Gérer les médias du site",
      color: "bg-pink-500",
    },
    {
      label: "Utilisateurs",
      href: "/admin/users/add",
      icon: <UserPlus className="h-12 w-12" />,
      description: "Gérer les comptes utilisateurs",
      color: "bg-teal-500",
    },
    {
      label: "Newsletter",
      href: "/admin/newsletter",
      icon: <Mail className="h-12 w-12" />,
      description: "Envoyer une newsletter aux abonnés",
      color: "bg-slate-500"
    },
  ];

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!currentUser || currentUser.userType !== 0) {
    return <UnauthorizedPage />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-12">
        Tableau de bord administrateur
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {adminLinks.map((link, index) => (
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
