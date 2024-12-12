"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { HoveredLink } from "../ui/navbar-menu";

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleSubMenu = (index: number | null) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  // Ajoutez cette nouvelle fonction
  const handleLinkClick = () => {
    setIsOpen(false);
    setOpenSubMenu(null);
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
          {/* Actualités */}
          <div className="flex justify-between items-center">
            <HoveredLink href="/actualites" onClick={handleLinkClick}>
              <strong>Actualités</strong>
            </HoveredLink>
          </div>

          {/* Programme */}
          <div className="flex justify-between items-center">
            <HoveredLink href="/programme" onClick={handleLinkClick}>
              <strong>Programme de l&apos;année</strong>
            </HoveredLink>
          </div>

          {/* Photos */}
          <div className="flex justify-between items-center">
            <HoveredLink href="/photos" onClick={handleLinkClick}>
              <strong>Photos</strong>
            </HoveredLink>
          </div>

          {/* Pratique */}
          <div className="flex justify-between items-center">
            <HoveredLink href="/pratique">
              <strong>Pratique</strong>
            </HoveredLink>
            <motion.div
              animate={{ rotate: openSubMenu === 1 ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer p-2"
              onClick={() => toggleSubMenu(1)}
            >
              <FaChevronDown />
            </motion.div>
          </div>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: openSubMenu === 1 ? "auto" : 0,
              opacity: openSubMenu === 1 ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden pl-4 space-y-3"
          >
            <HoveredLink href="/pratique/acces">Accès</HoveredLink>
            <HoveredLink href="/pratique/billetterie">Billetterie</HoveredLink>
            <HoveredLink href="/pratique/contact">Contact</HoveredLink>
          </motion.div>

          {/* Vidéos */}
          <div className="flex justify-between items-center">
            <HoveredLink href="/videos" onClick={handleLinkClick}>
              <strong>Vidéos</strong>
            </HoveredLink>
          </div>

          {/* Revues de Presse */}
          <div className="flex justify-between items-center">
            <HoveredLink href="/presse" onClick={handleLinkClick}>
              <strong>Revues de Presse</strong>
            </HoveredLink>
          </div>

          <div className="flex justify-between items-center">
            <HoveredLink href="/partenaires" onClick={handleLinkClick}>
              <strong>Partenaires</strong>
            </HoveredLink>
          </div>

          {/* Mon profil */}
          <div className="flex justify-between items-center">
            <HoveredLink href="/login">
              <strong>Mon profil</strong>
            </HoveredLink>
            <motion.div
              animate={{ rotate: openSubMenu === 2 ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer p-2"
              onClick={() => toggleSubMenu(2)}
            >
              <FaChevronDown />
            </motion.div>
          </div>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: openSubMenu === 2 ? "auto" : 0,
              opacity: openSubMenu === 2 ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden pl-4 space-y-3"
          >
            <HoveredLink href="/login">Se connecter</HoveredLink>
            <HoveredLink href="/register">S&apos;inscrire</HoveredLink>
          </motion.div>
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
