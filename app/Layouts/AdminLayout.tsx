"use client";
import Logout from "@/components/common/Logout";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconHome, IconSearch } from "@tabler/icons-react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  FileText,
  LogOut,
  Newspaper,
  PartyPopper,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function AdminLayout({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: {
    id: number;
    firstName: string;
    lastName: string;
    userType: string;
  };
}) {
  const links = [
    {
      label: "",
      href: "#",
      icon: (
        <IconSearch className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      searchBar: true,
    },
    {
      label: "Tableau de bord",
      href: "/admin",
      icon: (
        <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Partenaires",
      href: "/admin/users",
      icon: (
        <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "A propos",
      href: "/admin/certification",
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Evenements",
      href: "/admin/alertes",
      icon: (
        <PartyPopper className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Revue de presse",
      href: "/admin/alertes",
      icon: (
        <Newspaper className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const [open, setOpen] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className="justify-between gap-10 h-full">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div key={idx}>
                  {link.searchBar ? (
                    open ? (
                      <div className="px-3 py-1 -mt-5">
                        {" "}
                        <PlaceholdersAndVanishInput
                          placeholders={["Rechercher"]}
                          onChange={() => {}}
                          onSubmit={() => {}}
                          className="h-8"
                        />
                      </div>
                    ) : (
                      <SidebarLink link={link} />
                    )
                  ) : (
                    <SidebarLink link={link} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <AdminProfile
              open={open}
              showMenu={showAdminMenu}
              setShowMenu={setShowAdminMenu}
              currentUser={currentUser}
            />
            {showAdminMenu && (
              <AdminMenu open={open} showMenu={showAdminMenu} />
            )}
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-col flex-1 overflow-hidden bg-white">
        <div className="flex-1 overflow-auto">
          <div className="min-h-full w-full p-2 md:p-10 dark:bg-dark-mode">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="/"
      className="font-normal flex items-center space-x-2 text-sm text-black dark:text-white py-1 relative z-20"
    >
      <Image
        src="/logo.png"
        alt="Logo"
        width={24}
        height={24}
        className="flex-shrink-0"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre"
      >
        Administration
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="/"
      className="font-normal flex items-center space-x-2 text-sm text-black dark:text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </a>
  );
};

const AdminProfile = ({
  open,
  showMenu,
  setShowMenu,
  currentUser,
}: {
  open: boolean;
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  currentUser: {
    firstName: string;
    lastName: string;
    userType: string;
  };
}) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-between -ml-[7px] bg-neutral-100 dark:bg-dark-mode-2 rounded-lg cursor-pointer">
        <div className="flex items-center gap-2">
          <img
            src={`https://api.dicebear.com/6.x/micah/svg?seed=${encodeURIComponent(
              `${currentUser.firstName?.toLowerCase()}-${currentUser.lastName?.toLowerCase()}`
            )}`}
            alt="Admin Avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
          {open && (
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {currentUser.firstName} {currentUser.lastName}
              </span>
              <span className="text-xs text-neutral-500">
                {currentUser.userType}
              </span>
            </div>
          )}
        </div>
        {open && (
          <motion.div
            animate={{ rotate: showMenu ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowMenu(!showMenu)}
          >
            <ChevronDown className="h-5 w-5 text-neutral-500 hover:text-neutral-700 transition-colors" />
          </motion.div>
        )}
      </div>
      <AdminMenu open={open} showMenu={showMenu} />
    </div>
  );
};

const AdminMenu = ({
  open,
  showMenu,
}: {
  open: boolean;
  showMenu: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{
        opacity: open && showMenu ? 1 : 0,
        y: open && showMenu ? 0 : -10,
        display: open && showMenu ? "block" : "none",
      }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-full left-0 right-0 mb-8 bg-white dark:bg-dark-mode-2 rounded-lg shadow-lg p-2"
    >
      <a
        href="/user/profile"
        className="flex items-center gap-2 p-2 hover:bg-neutral-100 dark:hover:bg-dark-mode-2 rounded"
      >
        <User className="h-5 w-5" />
        <span>Mon compte</span>
      </a>
      <Logout className="flex items-center gap-2 p-2 hover:bg-neutral-100 dark:hover:bg-dark-mode-2 rounded text-red-500 w-full">
        <LogOut className="h-5 w-5" />
        <span>Se déconnecter</span>
      </Logout>
    </motion.div>
  );
};
