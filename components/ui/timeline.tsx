"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);

    if (ref.current) {
      const timer = setTimeout(() => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
          setHeight(rect.height);
          setIsReady(true);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [ref, data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="w-full bg-white dark:bg-dark-mode font-sans md:px-10"
      ref={containerRef}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      key={`timeline-container-${data.length}`}
    >
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <motion.div
            key={`${index}-${item.title}`}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
            variants={itemVariants}
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-dark-mode-2 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-red-brou dark:bg-neutral-800 border border-red-brou-2 dark:border-neutral-700 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </motion.div>
        ))}
        <div
          style={{
            height: height + "px",
            opacity: isReady ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
        >
          {isReady && (
            <motion.div
              style={{
                height: heightTransform,
                opacity: opacityTransform,
              }}
              className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-red-brou via-red-brou-2 to-transparent from-[0%] via-[10%] rounded-full"
              initial={{ height: 0 }}
              animate={{
                height: "auto",
                transition: {
                  duration: 0.8,
                  ease: "easeOut",
                },
              }}
              transition={{
                type: "spring",
                stiffness: 50,
                damping: 20,
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
