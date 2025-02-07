"use client";

import { ImageViewer } from "@/components/common/ImageViewer";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const translateFirst = useTransform(
    scrollYProgress,
    [0, 1],
    [0, window.innerWidth < 768 ? -200 : -400]
  );
  const translateSecond = useTransform(
    scrollYProgress,
    [0, 1],
    [0, window.innerWidth < 768 ? 200 : 400]
  );
  const translateThird = useTransform(
    scrollYProgress,
    [0, 1],
    [0, window.innerWidth < 768 ? -200 : -400]
  );

  const isYoutubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const rows: Media[][] = [[], [], []];
  media.forEach((item, idx) => {
    rows[idx % 3].push(item);
  });

  return (
    <>
      <div
        ref={containerRef}
        className="min-h-screen h-auto flex items-start justify-center overflow-hidden"
      >
        <div className="flex items-start justify-center">
          <div className="grid grid-cols-3 gap-4 px-4 max-w-7xl mx-auto">
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
                    {isYoutubeUrl(item.url) ? (
                      <div className="h-[200px] md:h-[350px] w-full md:w-[250px] relative">
                        <div className="relative w-full h-full bg-black flex items-center justify-center">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-red-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-6 h-6 md:w-8 md:h-8 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ImageViewer
                        src={item.url}
                        alt={item.alt_text || item.title}
                      >
                        <div className="h-[200px] md:h-[350px] w-full md:w-[250px] relative">
                          <Image
                            src={item.url}
                            alt={item.alt_text || item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </ImageViewer>
                    )}
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
