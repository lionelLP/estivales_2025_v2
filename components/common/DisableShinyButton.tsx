"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ShinyButtonProps {
  text: string;
  className?: string;
}

const ShinyButton = ({
  text = "shiny-button",
  className,
}: ShinyButtonProps) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative rounded-lg px-6 py-2 font-medium backdrop-blur-xl transition-[box-shadow] duration-300 ease-in-out hover:shadow bg-gray-200 text-neutral-900 overflow-hidden cursor-not-allowed",
        className
      )}
    >
      <span className="relative block h-full w-full text-sm uppercase tracking-wide text-[rgb(47, 47, 47)] dark:font-light">
        {text}
      </span>
      <span className="absolute inset-0 z-10 block rounded-[inherit] bg-gradient-to-r from-transparent via-white/25 to-transparent p-px animate-[shine_1.5s_infinite]" />
    </motion.button>
  );
};

export default ShinyButton;
