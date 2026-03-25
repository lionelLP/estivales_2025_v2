"use client";

import { ImageViewer } from "@/components/common/ImageViewer";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";
import { Play, Music, X } from "lucide-react";

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
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    offset: ["start start", "end start"],
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const isVideo = (item: Media) => {
    return (
      item.type.startsWith("video/") ||
      (item.url &&
        (item.url.includes("youtube.com") || item.url.includes("youtu.be")))
    );
  };

  const isAudio = (item: Media) => {
    return item.type.startsWith("audio/");
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
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  };

  const renderMediaItem = (item: Media, idx: number, translate: any, partIdx: number) => (
    <motion.div
      key={`grid-${partIdx}-${idx}`}
      style={{ y: translate }}
      className="group relative rounded-lg overflow-hidden cursor-pointer mb-10"
      onClick={() => {
        if (isVideo(item) || isAudio(item)) {
          setSelectedMedia(item);
        }
      }}
    >
      {isYoutubeUrl(item.url) ? (
        <div className="h-[200px] md:h-[350px] w-full relative">
          <div className="relative w-full h-full bg-black flex items-center justify-center font-sans">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-red-600 rounded-full flex items-center justify-center z-10 transition-transform group-hover:scale-110">
              <Play className="w-6 h-6 md:w-8 md:h-8 text-white fill-current" />
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
      ) : isVideo(item) ? (
        <div className="h-[200px] md:h-[350px] w-full relative bg-gray-900 flex items-center justify-center font-sans">
          <Play className="w-16 h-16 text-white opacity-50 z-10" />
          <video
            src={item.url}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            muted
            preload="metadata"
          />
        </div>
      ) : isAudio(item) ? (
        <div className="h-[200px] md:h-[350px] w-full relative bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex flex-col items-center justify-center p-6 border border-white/10 font-sans">
          <Music className="w-20 h-20 text-pink-500 mb-4 animate-pulse" />
          <p className="text-white text-center font-medium truncate w-full px-4">{item.title}</p>
          <div className="mt-4 bg-white/10 rounded-full p-3 transition-transform group-hover:scale-110">
             <Play className="w-6 h-6 text-white fill-current" />
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
  );

  return (
    <>
      <div
        ref={containerRef}
        className="h-[40rem] items-start overflow-y-auto w-full no-scrollbar"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start max-w-5xl mx-auto gap-10 py-40 px-10">
          <div className="grid">
            {firstPart.map((item, idx) => renderMediaItem(item, idx, translateFirst, 1))}
          </div>
          <div className="grid">
            {secondPart.map((item, idx) => renderMediaItem(item, idx, translateSecond, 2))}
          </div>
          <div className="grid">
            {thirdPart.map((item, idx) => renderMediaItem(item, idx, translateThird, 3))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 md:p-10"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {isYoutubeUrl(selectedMedia.url) ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                      selectedMedia.url
                    )}?autoplay=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : isVideo(selectedMedia) ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl bg-black">
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    className="w-full h-full"
                  />
                </div>
              ) : isAudio(selectedMedia) ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl flex flex-col items-center font-sans">
                  <Music className="w-24 h-24 text-pink-500 mb-6" />
                  <h3 className="text-xl font-bold mb-6 dark:text-white">{selectedMedia.title}</h3>
                  <audio
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    className="w-full max-w-lg"
                  />
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
