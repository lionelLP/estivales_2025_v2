"use client";

import React, { useRef, useState } from "react";
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
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const gridRef = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start start", "end end"],
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const rows = splitArrayIntoRows(media, 3);

  const isYoutubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <>
      <div
        className="h-[200vh] md:h-[300vh] overflow-hidden antialiased relative flex flex-col gap-4"
        ref={gridRef}
      >
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="flex gap-4 items-start px-4 mx-auto">
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
                    className="group relative rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (isYoutubeUrl(item.url)) {
                        setSelectedVideo(item.url);
                      }
                    }}
                  >
                    <div className="h-[350px] w-[250px] relative">
                      {isYoutubeUrl(item.url) ? (
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.alt_text || item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
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

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="w-full max-w-4xl aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                selectedVideo
              )}?autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

function splitArrayIntoRows<T>(array: T[], numberOfRows: number): T[][] {
  const result: T[][] = Array.from({ length: numberOfRows }, () => []);
  array.forEach((item, index) => {
    result[index % numberOfRows].push(item);
  });
  return result;
}
