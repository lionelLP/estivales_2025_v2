"use client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
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
  const { user } = useAuth();
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
        <MenuItem setActive={setActive} active={active} item="Programmes">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/programmes/to-come">À venir</HoveredLink>
            <HoveredLink href="/programmes/past">Passés</HoveredLink>
          </div>
        </MenuItem>

        <MenuItemNoHoverLink
          setActive={setActive}
          item="Billetterie"
          href="/billetterie"
        />

        <MenuItemNoHoverLink
          setActive={setActive}
          item="Medias"
          href="/media"
        />
        <MenuItemNoHoverLink
          setActive={setActive}
          item="Presse"
          href="/presse"
        />
        <MenuItemNoHoverLink
          setActive={setActive}
          item="A propos"
          href="/about"
        />
        <MenuItemNoHoverLink
          setActive={setActive}
          item="Partenaires"
          href="/partners"
        />
        {(user?.userType === 0 || user?.userType === 1) && (
          <MenuItemNoHoverLink
            setActive={setActive}
            item="Espace Choriste"
            href="/espace-choriste"
            className="font-semibold text-red-brou bg-red-brou/10 px-3 py-1 rounded-full hover:bg-red-brou/15 transition-colors"
          />
        )}
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
