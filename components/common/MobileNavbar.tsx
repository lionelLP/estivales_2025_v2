"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthentication } from "@/hooks/useAuthentication";
import { motion } from "framer-motion";
import { CircleUser, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HoveredLink } from "../ui/navbar-menu";

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const { user } = useAuth();
  const { logout } = useAuthentication();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <div className="block lg:hidden fixed top-0 inset-x-0 z-50 dark:bg-dark-mode-2 p-4">
      {/* Hamburger Button */}
      <div className="flex justify-between items-center border rounded-full px-3 py-1 bg-white dark:bg-dark-mode z-50 relative shadow-lg">
        <div>
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
        <button
          onClick={toggleMenu}
          className={`hamb ${
            isOpen ? "active" : ""
          } focus:outline-none text-black dark:text-white`}
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
        >
          <span className="sr-only">{isOpen ? "Close Menu" : "Open Menu"}</span>
          <svg className="ham" viewBox="0 0 100 100">
            <path
              className="line top"
              d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20"
            ></path>
            <path className="line middle" d="m 30,50 h 40"></path>
            <path
              className="line bottom"
              d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20"
            ></path>
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? "100vh" : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-y-auto bg-white dark:bg-dark-mode rounded-2xl -mt-12 max-h-[calc(100vh-5rem)] border"
      >
        <nav className="mt-14 flex flex-col space-y-4 p-2.5">
          {/* Boutons de connexion/inscription */}
          <div className="flex gap-2 mb-4">
            {user ? (
              <>
                <Link
                  href="/admin"
                  className="flex items-center justify-center gap-2 w-1/2 bg-white dark:bg-dark-mode text-red-brou border-2 border-red-brou hover:bg-gray-50 dark:hover:bg-dark-mode rounded-full py-2 px-4 transition-colors duration-200"
                  onClick={handleLinkClick}
                >
                  <User className="w-5 h-5 text-red-brou" />
                  <span className="font-medium text-red-brou">Mon Espace</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    handleLinkClick();
                  }}
                  className="flex items-center justify-center gap-2 w-1/2 bg-primary text-white bg-red-brou rounded-full py-2 px-4 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5 text-white dark:text-dark-mode" />
                  <span className="font-medium text-white dark:text-dark-mode">
                    Se déconnecter
                  </span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-1/2 bg-primary text-white bg-red-brou rounded-full py-2 px-4 transition-colors duration-200"
                  onClick={handleLinkClick}
                >
                  <CircleUser className="w-5 h-5 text-white dark:text-dark-mode" />
                  <span className="font-medium text-white dark:text-dark-mode">
                    Se connecter
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Programme avec sous-menu */}
          <div className="flex flex-col">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setIsProgramOpen(!isProgramOpen)}
            >
              <span className="font-bold">Programmes</span>
              <motion.svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                animate={{ rotate: isProgramOpen ? 180 : 0 }}
                className="text-black dark:text-white"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </div>

            <motion.div
              initial={{ height: 0 }}
              animate={{ height: isProgramOpen ? "auto" : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden ml-4"
            >
              <div className="flex flex-col space-y-2 py-2">
                <HoveredLink
                  href="/programmes/to-come"
                  onClick={handleLinkClick}
                >
                  À venir
                </HoveredLink>
                <HoveredLink href="/programmes/past" onClick={handleLinkClick}>
                  Programmes passés
                </HoveredLink>
              </div>
            </motion.div>
          </div>

          {/* Photos */}
          <div className="flex justify-between items-center">
            <HoveredLink href="/media" onClick={handleLinkClick}>
              <strong>Medias</strong>
            </HoveredLink>
          </div>

          {/* Vidéos */}
          <div className="flex justify-between items-center">
            <HoveredLink href="/presse" onClick={handleLinkClick}>
              <strong>Presse</strong>
            </HoveredLink>
          </div>

          {/* Revues de Presse */}
          <div className="flex justify-between items-center">
            <HoveredLink href="/about" onClick={handleLinkClick}>
              <strong>À propos</strong>
            </HoveredLink>
          </div>

          <div className="flex justify-between items-center">
            <HoveredLink href="/partners" onClick={handleLinkClick}>
              <strong>Partenaires</strong>
            </HoveredLink>
          </div>

          {/* Mon profil */}
        </nav>
      </motion.div>

      {/* CSS encapsulé */}
      <style jsx>{`
        button {
          color: black;
        }
        .hamb {
          position: relative;
          margin-right: -0.625rem;
          border-width: 0px;
          background-color: transparent;
          padding: 0;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        .hamb .ham {
          -webkit-tap-highlight-color: transparent;
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
          height: 60px;
          width: 60px;
          cursor: pointer;
          transition-duration: 0.3s;
        }
        .hamb .ham .top {
          stroke-dasharray: 40 160;
        }
        .hamb .ham .middle {
          transform-origin: 50%;
          stroke-dasharray: 40 142;
        }
        .hamb .ham .bottom {
          transform-origin: 50%;
          stroke-dasharray: 40 85;
        }
        .hamb .line {
          fill: none;
          stroke: black;
          stroke-width: 5;
          transition-duration: 0.3s;
          stroke-linecap: round;
        }
        @media (prefers-color-scheme: dark) {
          .hamb .line {
            stroke: white;
          }
        }
        .hamb.active svg {
          --tw-rotate: 45deg;
          transform: rotate(var(--tw-rotate));
        }
        .hamb.active svg .top {
          stroke-dashoffset: -64px;
        }
        .hamb.active svg .middle {
          --tw-rotate: 90deg;
          transform: rotate(var(--tw-rotate));
        }
        .hamb.active svg .bottom {
          stroke-dashoffset: -64px;
        }
      `}</style>
    </div>
  );
}
