"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link, { LinkProps } from "next/link";
import React from "react";

const transition = {
  type: "spring" as const,
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
  image,
  href, // Ajout de la prop href
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
  image?: string;
  href?: string; // Définition du type pour href
}) => {
  const content = (
    <motion.p
      transition={{ duration: 0.3 }}
      className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
    >
      {item}
    </motion.p>
  );

  return (
    <div onMouseEnter={() => setActive(item)} className="relative ">
      {href ? (
        <Link href={href} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-white dark:bg-dark-mode backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="w-max h-full p-4"
                >
                  {image && typeof image === "string" ? (
                    <Image
                      src={image}
                      width={140}
                      height={70}
                      alt={item}
                      className="flex-shrink-0 rounded-md shadow-2xl"
                    />
                  ) : (
                    children
                  )}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const MenuItemWithImage = ({
  setActive,
  active,
  item,
  image,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  image?: string; // Image en tant que prop optionnelle
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      {image ? (
        // Si une image est fournie, elle est affichée à la place du texte
        <motion.div
          transition={{ duration: 0.3 }}
          className="cursor-pointer hover:opacity-[0.9]"
        >
          <Image
            src={image}
            alt={item}
            width={30}
            height={30} // Ajuster la taille de l&apos;image
            className="rounded-full"
          />
        </motion.div>
      ) : (
        // Sinon, le texte est affiché
        <motion.p
          transition={{ duration: 0.3 }}
          className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
        >
          {item}
        </motion.p>
      )}
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            mass: 0.5,
            damping: 11.5,
            stiffness: 100,
            restDelta: 0.001,
            restSpeed: 0.001,
          }}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={{
                  type: "spring",
                  mass: 0.5,
                  damping: 11.5,
                  stiffness: 100,
                  restDelta: 0.001,
                  restSpeed: 0.001,
                }}
                layoutId="active"
                className="bg-white dark:bg-dark-mode backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div layout className="w-max h-full p-4">
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const MenuItemWithIcon = ({
  setActive,
  active,
  item,
  icon: Icon,
  children,
  href, // Ajout de la prop href
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  icon: LucideIcon;
  children?: React.ReactNode;
  href?: string; // Définition du type pour href
}) => {
  const content = (
    <motion.div
      transition={{ duration: 0.3 }}
      className="cursor-pointer hover:opacity-[0.9]"
    >
      <Icon className="w-8 h-8 text-black dark:text-white" />
    </motion.div>
  );

  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      {href ? (
        <Link href={href} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-white dark:bg-dark-mode backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div layout className="w-max h-full p-4">
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const MenuItemNoBubble = ({
  setActive,
  active,
  href,
  children,
}: {
  setActive: (item: string | null) => void;
  active: string | null;
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      onMouseEnter={() => setActive(href)}
      onMouseLeave={() => setActive(null)}
      className="relative"
    >
      {/* Lien cliquable */}
      <Link
        href={href}
        className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
      >
        {children}
      </Link>

      {/* Bulle avec animation fluide */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 10 }}
        animate={
          active === href || active === null
            ? { opacity: 0, scale: 0, y: 10 }
            : { opacity: 0, scale: 0.85, y: 10 }
        }
        transition={transition}
        className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4"
      >
        {/* Utilise un espace réservé pour maintenir la continuité avec la bulle */}
        <div className="bg-white dark:bg-dark-mode backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl">
          <div className="w-max h-full p-4">
            {/* Contenu de la bulle pour le MenuItem */}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className="relative rounded-full border border-transparent dark:bg-dark-mode dark:border-white/[0.2] bg-white shadow-input flex items-center justify-center space-x-4 p-4 "
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({
  children,
  ...rest
}: LinkProps & { children: React.ReactNode }) => {
  return (
    <Link
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black hover:dark:text-bleu-clair flex flex-col"
    >
      {children}
    </Link>
  );
};

export const MenuItemNoHoverLink = ({
  setActive,
  item,
  href,
}: {
  setActive: (item: string) => void;
  item: string;
  href: string;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      <Link href={href} className="block">
        <motion.p
          transition={{ duration: 0.3 }}
          className="cursor-pointer text-black hover:opacity-[0.9] dark:text-white"
        >
          {item}
        </motion.p>
      </Link>
    </div>
  );
};
