"use client";
import { cn } from "@/lib/utils";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import * as React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const radius = 100; // Changer cette valeur pour ajuster le rayon de l'effet hover
    const [visible, setVisible] = React.useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({
      currentTarget,
      clientX,
      clientY,
    }: React.MouseEvent<HTMLElement>) {
      const { left, top } = currentTarget.getBoundingClientRect();

      const x = clientX - left;
      const y = clientY - top;

      mouseX.set(x);
      mouseY.set(y);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${
                visible ? radius + "px" : "0px"
              } circle at ${mouseX}px ${mouseY}px,
              rgba(237, 5, 123, 0.6),
              transparent 80%
            )
          `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          setVisible(true);
        }}
        onMouseLeave={() => {
          setVisible(false);
        }}
        className="p-[2px] rounded-lg w-full"
      >
        <input
          type={type}
          className={cn(
            `h-10 w-full border-none bg-gray-50 dark:bg-zinc-800 text-black dark:text-white shadow-input rounded-md px-3 py-2 text-sm 
            file:border-0 file:bg-transparent 
            file:text-sm file:font-medium placeholder:text-neutral-400 
            focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600
            disabled:cursor-not-allowed disabled:opacity-50 selection:bg-red-brou selection:text-white
            hover:placeholder:text-[#5a5a64] focus:placeholder:text-[#5a5a64] 
            dark:hover:placeholder:text-[rgb(249,250,251)] dark:focus:placeholder:text-[rgb(249,250,251)]
            placeholder:transition-colors placeholder:duration-250`,
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  }
);

Input.displayName = "Input";

export { Input };
