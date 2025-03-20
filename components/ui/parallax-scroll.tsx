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
  alt_text?: string | null;
  uploaded_at?: string;
  size?: number;
  is_favorite?: boolean;
}

export const ParallaxScroll = ({ media }: { media: Media[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    offset: ["start start", "end start"],
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const isVideo = (item: Media) => {
    return (
      item.type === "video/youtube" ||
      (item.url &&
        (item.url.includes("youtube.com") || item.url.includes("youtu.be")))
    );
  };

  const isYoutubeUrl = (url: string) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const third = Math.ceil(media.length / 3);
  const firstPart = media.slice(0, third);
  const secondPart = media.slice(third, 2 * third);
  const thirdPart = media.slice(2 * third);

  const getYoutubeThumbnail = (url: string) => {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return "";

    // Utiliser l'API de vignettes YouTube, qui est autorisée dans next.config.js
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  return (
    <>
      <div
        ref={containerRef}
        className="h-[40rem] items-start overflow-y-auto w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start max-w-5xl mx-auto gap-10 py-40 px-10">
          <div className="grid gap-10">
            {firstPart.map((item, idx) => (
              <motion.div
                key={`grid-1-${idx}`}
                style={{ y: translateFirst }}
                className="group relative rounded-lg overflow-hidden cursor-pointer"
                onClick={() => {
                  if (isVideo(item)) {
                    setSelectedVideo(item.url);
                  }
                }}
              >
                {isYoutubeUrl(item.url) ? (
                  <div className="h-[200px] md:h-[350px] w-full relative">
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
                      
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${getYoutubeThumbnail(item.url)})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: 0.6
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <ImageViewer src={item.url} alt={item.alt_text || item.title}>
                    <div className="h-[200px] md:h-[350px] w-full relative">
                      <Image
                        src={item.url}
                        alt={item.alt_text || item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </ImageViewer>
                )}
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10">
            {secondPart.map((item, idx) => (
              <motion.div
                key={`grid-2-${idx}`}
                style={{ y: translateSecond }}
                className="group relative rounded-lg overflow-hidden cursor-pointer"
                onClick={() => {
                  if (isVideo(item)) {
                    setSelectedVideo(item.url);
                  }
                }}
              >
                {isYoutubeUrl(item.url) ? (
                  <div className="h-[200px] md:h-[350px] w-full relative">
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
                      
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${getYoutubeThumbnail(item.url)})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: 0.6
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <ImageViewer src={item.url} alt={item.alt_text || item.title}>
                    <div className="h-[200px] md:h-[350px] w-full relative">
                      <Image
                        src={item.url}
                        alt={item.alt_text || item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </ImageViewer>
                )}
              </motion.div>
            ))}
          </div>

          <div className="grid gap-10">
            {thirdPart.map((item, idx) => (
              <motion.div
                key={`grid-3-${idx}`}
                style={{ y: translateThird }}
                className="group relative rounded-lg overflow-hidden cursor-pointer"
                onClick={() => {
                  if (isVideo(item)) {
                    setSelectedVideo(item.url);
                  }
                }}
              >
                {isYoutubeUrl(item.url) ? (
                  <div className="h-[200px] md:h-[350px] w-full relative">
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
                      
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${getYoutubeThumbnail(item.url)})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: 0.6
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <ImageViewer src={item.url} alt={item.alt_text || item.title}>
                    <div className="h-[200px] md:h-[350px] w-full relative">
                      <Image
                        src={item.url}
                        alt={item.alt_text || item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </ImageViewer>
                )}
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
