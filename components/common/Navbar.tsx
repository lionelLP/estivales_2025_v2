"use client";
import { cn } from "@/lib/utils";
import { CircleUser } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  HoveredLink,
  Menu,
  MenuItem,
  MenuItemWithIcon,
} from "../ui/navbar-menu";
import UserMenu from "./UserMenu";

export default function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn(
        "fixed top-10 inset-x-0 max-w-4xl	mx-auto z-50 border rounded-full",
        className
      )}
    >
      <Menu setActive={setActive}>
        <div className="flex items-center space-x-3 ">
          <a href="/">
            <Image
              src="/logoOpenWing.png"
              alt="Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
          </a>
        </div>

        <MenuItem
          setActive={setActive}
          active={active}
          item="Qui sommes-nous ?"
          href="/about"
        >
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/about#notre-cabinet">Notre cabinet</HoveredLink>
            <HoveredLink href="/about#nous">Nous</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Partenaires">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/">Nos partenaires</HoveredLink>
            <HoveredLink href="/">Devenir partenaire</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem
          setActive={setActive}
          active={active}
          item="Contact"
          href="/contact"
        >
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/contact?form=contact">Demandes</HoveredLink>
            <HoveredLink href="/contact?form=feedback&type=suggestion">
              Suggestions
            </HoveredLink>
            <HoveredLink href="/contact?form=feedback&type=reclamation">
              Réclamations
            </HoveredLink>
          </div>
        </MenuItem>
        <MenuItem
          setActive={setActive}
          active={active}
          item="Professionnel"
          href="/professionnel"
        >
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/form/Professionnelle/agriculteur">
              Agriculteur
            </HoveredLink>
            <HoveredLink href="/">Artisan</HoveredLink>
            <HoveredLink href="/">Commercant</HoveredLink>
            <HoveredLink href="/">Profession libérale</HoveredLink>
            <HoveredLink href="/">Autre</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem
          setActive={setActive}
          active={active}
          item="Particulier"
          href="/particulier"
        >
          <div className="  text-sm grid grid-cols-3 gap-3 p-4">
            <HoveredLink href="/">Automobile</HoveredLink>
            <HoveredLink href="/">Bateau</HoveredLink>
            <HoveredLink href="/">Chien et Chat</HoveredLink>
            <HoveredLink href="/">Décès</HoveredLink>
            <HoveredLink href="/">Deux-Roues</HoveredLink>
            <HoveredLink href="/">Assurance Emprunteur</HoveredLink>
            <HoveredLink href="/">Equidé</HoveredLink>
            <HoveredLink href="/">Habitation</HoveredLink>
            <HoveredLink href="/">Instrument de musique</HoveredLink>
            <HoveredLink href="/">Prévoyance</HoveredLink>
            <HoveredLink href="/">Retraite</HoveredLink>
            <HoveredLink href="/">Risques spéciaux</HoveredLink>
            <HoveredLink href="/">Santé</HoveredLink>
            <HoveredLink href="/">Scolaire</HoveredLink>
            <HoveredLink href="/">Vie - Epargne</HoveredLink>
            <HoveredLink href="/">Juridique</HoveredLink>
            <HoveredLink href="/">Permis de conduire</HoveredLink>
            <HoveredLink href="/">Protection juridique</HoveredLink>
            <HoveredLink href="/">Protection sociale</HoveredLink>
            <HoveredLink href="/">Protection vie privée</HoveredLink>
            <HoveredLink href="/">Protection vie professionnelle</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Association">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/">Locaux</HoveredLink>
            <HoveredLink href="/">Responsabilité civile</HoveredLink>
          </div>
        </MenuItem>
        <MenuItemWithIcon
          setActive={setActive}
          active={active}
          item="Compte"
          icon={CircleUser}
        >
          <UserMenu />
        </MenuItemWithIcon>
      </Menu>
    </div>
  );
}
