"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

interface Media {
  id: number;
  url: string;
  type: string;
  title: string;
  alt_text: string | null;
  uploaded_at: string;
  size: number;
  is_favorite: boolean;
}

export const ParallaxScroll = ({ media }: { media: Media[] }) => {
  const gridRef = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start start", "end end"],
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const rows = splitArrayIntoRows(media, 3);

  return (
    <div
      className="h-[300vh] py-40 overflow-hidden antialiased relative flex flex-col gap-4"
      ref={gridRef}
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="flex gap-4 items-start px-4">
          {rows.map((row, rowIndex) => (
            <motion.div
              key={rowIndex}
              style={{
                y:
                  rowIndex === 1
                    ? translateSecond
                    : rowIndex === 2
                    ? translateThird
                    : translateFirst,
              }}
              className="flex flex-col gap-4"
            >
              {row.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-lg overflow-hidden"
                >
                  <div className="h-[350px] w-[250px] relative">
                    <Image
                      src={item.url}
                      alt={item.alt_text || item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-4 text-white">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm opacity-80">
                        {new Date(item.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

function splitArrayIntoRows<T>(array: T[], numberOfRows: number): T[][] {
  const result: T[][] = Array.from({ length: numberOfRows }, () => []);
  array.forEach((item, index) => {
    result[index % numberOfRows].push(item);
  });
  return result;
}
