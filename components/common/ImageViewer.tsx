import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X } from "lucide-react";
import Image from "next/image";

interface ImageViewerProps {
  src: string;
  alt: string;
  children: React.ReactNode;
}

export function ImageViewer({ src, alt, children }: ImageViewerProps) {
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
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-fit h-fit p-0 border-none bg-transparent">
        <DialogTitle asChild>
          <VisuallyHidden>{alt}</VisuallyHidden>
        </DialogTitle>
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="relative w-auto h-auto max-w-[90vw] max-h-[90vh]">
            <DialogPrimitive.Close className="absolute -right-4 -top-4 p-2 rounded-full bg-white shadow-lg hover:bg-gray-200 transition-all z-50">
              <X className="w-6 h-6 text-neutral-900" />
            </DialogPrimitive.Close>
            {isYoutubeUrl(src) ? (
              <div className="w-full max-w-4xl aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                    src
                  )}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            ) : (
              <Image
                src={src}
                alt={alt}
                width={1920}
                height={1080}
                className="object-contain w-auto h-auto max-w-[90vw] max-h-[90vh] rounded-lg"
                priority
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
