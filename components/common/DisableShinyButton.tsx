"use client";

import { cn } from "@/lib/utils";
import { motion, type AnimationProps } from "framer-motion";

const animationProps = {
  initial: { "--x": "100%" } as React.CSSProperties,
  animate: { "--x": "-100%" } as React.CSSProperties,
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 1,
    type: "spring",
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: "spring",
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as AnimationProps;

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
      {...animationProps}
      className={cn(
        "relative rounded-lg px-6 py-2 font-medium backdrop-blur-xl transition-[box-shadow] duration-300 ease-in-out hover:shadow bg-gray-200 text-gray-800 overflow-hidden cursor-not-allowed", // Fond bleu clair (bg-blue-300)
        className
      )}
      style={{ "--x": "100%" } as React.CSSProperties}
    >
      <span className="relative block h-full w-full text-sm uppercase tracking-wide text-[rgb(47, 47, 47)] dark:font-light">
        {text}
      </span>
      <span className="absolute inset-0 z-10 block rounded-[inherit]  p-px"></span>
    </motion.button>
  );
};

export default ShinyButton;
