"use client";
import { cn } from "@/lib/utils";
import { CircleUser } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import {
  HoveredLink,
  Menu,
  MenuItem,
  MenuItemNoHoverLink,
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
              src="/logo.png"
              alt="Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
          </a>
        </div>
        <MenuItemNoHoverLink
          setActive={setActive}
          item="Actualités"
          href="/actualites"
        />
        <MenuItemNoHoverLink
          setActive={setActive}
          item="Programme"
          href="/programme"
        />
        <MenuItemNoHoverLink
          setActive={setActive}
          item="Photos"
          href="/photos"
        />
        <MenuItem setActive={setActive} active={active} item="Pratique">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/pratique/acces">Accès</HoveredLink>
            <HoveredLink href="/pratique/billetterie">Billetterie</HoveredLink>
            <HoveredLink href="/pratique/contact">Contact</HoveredLink>
          </div>
        </MenuItem>
        <MenuItemNoHoverLink
          setActive={setActive}
          item="Vidéos"
          href="/videos"
        />
        <MenuItemNoHoverLink
          setActive={setActive}
          item="Presse"
          href="/presse"
        />
        <MenuItemNoHoverLink
          setActive={setActive}
          item="Partenaires"
          href="/partenaires"
        />
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
