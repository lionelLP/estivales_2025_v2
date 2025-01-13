"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthentication } from "@/hooks/useAuthentication";
import Link from "next/link";
import { HoveredLink } from "../ui/navbar-menu";

export default function UserMenu() {
  const { user } = useAuth();
  const { logout } = useAuthentication();

  return (
    <div className="flex flex-col space-y-4 text-sm text-left">
      {!user ? (
        <>
          <HoveredLink href="/login">Se connecter</HoveredLink>
          <HoveredLink href="/register">S&apos;inscrire</HoveredLink>
        </>
      ) : (
        <>
          <Link
            href="/admin"
            className="flex items-center gap-2 hover:text-neutral-500"
          >
            <span>Panneau de configuration</span>
          </Link>
          <button onClick={logout} className="text-left hover:text-neutral-500">
            Se déconnecter
          </button>
        </>
      )}
    </div>
  );
}
