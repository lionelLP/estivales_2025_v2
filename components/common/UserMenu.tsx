"use client";
import { HoveredLink } from "../ui/navbar-menu";

export default function UserMenu() {
  return (
    <div className="flex flex-col space-y-4 text-sm text-left">
      <HoveredLink href="/login">Se connecter</HoveredLink>
      <HoveredLink href="/register">S&apos;inscrire</HoveredLink>
      <HoveredLink href="/register">Se déconnecter</HoveredLink>
    </div>
  );
}
