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
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => Promise<void> | void;
}

const ShinyButton = ({
  text = "shiny-button",
  className,
  disabled,
  type = "button",
  onClick,
}: ShinyButtonProps) => {
  return (
    <motion.button
      {...animationProps}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        "relative rounded-lg px-6 py-2 font-medium backdrop-blur-xl transition-[box-shadow] duration-300 ease-in-out hover:shadow bg-red-brou text-white overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      style={{ "--x": "100%" } as React.CSSProperties}
    >
      <span
        className="relative block h-full w-full text-sm uppercase tracking-wide text-[rgb(255,255,255)] dark:font-light"
        style={{
          maskImage:
            "linear-gradient(-75deg, rgba(255,255,255,1) calc(var(--x) + 20%), transparent calc(var(--x) + 30%), rgba(255,255,255,1) calc(var(--x) + 100%))",
          WebkitMaskImage:
            "linear-gradient(-75deg, rgba(255,255,255,1) calc(var(--x) + 20%), transparent calc(var(--x) + 30%), rgba(255,255,255,1) calc(var(--x) + 100%))",
        }}
      >
        {text}
      </span>
      <span className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,rgba(237,5,123,0.1)_calc(var(--x)+20%),rgba(255,255,255,1)_calc(var(--x)+25%),rgba(237,5,123,0.1)_calc(var(--x)+100%))] p-px"></span>
    </motion.button>
  );
};

export default ShinyButton;
