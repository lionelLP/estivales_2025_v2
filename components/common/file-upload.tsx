import { cn } from "@/lib/utils";
import { IconUpload, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const fileCardVariant = {
  initial: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

const DeleteButton = ({
  onDelete,
  isDeleting,
  onHoverStart,
  onHoverEnd,
}: {
  onDelete: () => void;
  isDeleting: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <motion.button
      onClick={handleClick}
      className="text-red-500 hover:text-red-700 flex-shrink-0 flex items-center"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      disabled={isDeleting}
    >
      <IconX size={24} />
    </motion.button>
  );
};

interface FileUploadProps {
  onChange: (files: File[]) => void;
  maxFiles?: number;
  initialFiles?: File[];
  accept?: string;
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  maxFiles = 3,
  initialFiles = [],
  accept,
  multiple = true,
}) => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onChange(files);
  };

  const handleRemoveFile = (index: number) => {
    setDeletingIndex(index);
    setTimeout(() => {
      const updatedFiles = files.filter((_, idx) => idx !== index);
      setFiles(updatedFiles);
      onChange(updatedFiles);
      setDeletingIndex(null);
    }, 200); // Réduit le délai à 200ms pour correspondre à la durée de l'animation
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    onChange(acceptedFiles);
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple,
    noClick: true,
    onDrop: handleDrop,
    accept: accept ? { [accept]: [] } : undefined,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="pb-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="">
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {files.length < maxFiles && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 mb-8 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Déposer ici
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {files.length < maxFiles && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}

            <AnimatePresence>
              {files.map((file, idx) => {
                return (
                  <motion.div
                    key={`file-${idx}`}
                    className="flex items-center gap-2 mt-4"
                    variants={fileCardVariant}
                    initial="initial"
                    exit="exit"
                  >
                    <motion.div
                      layoutId={`file-upload-${idx}`}
                      className={cn(
                        "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 w-full rounded-md",
                        "shadow-sm"
                      )}
                      animate={
                        hoveredIndex === idx
                          ? {
                              x: [0, -2, 2, -2, 2, 0],
                              transition: {
                                duration: 0.4,
                                repeat: 2,
                                repeatType: "mirror",
                                ease: "easeInOut",
                              },
                            }
                          : undefined
                      }
                    >
                      <div className="flex justify-between w-full items-center gap-4">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                        >
                          {file.name}
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className="rounded-lg px-2 py-1 w-fit flex-shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                        >
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </motion.p>
                      </div>

                      <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 "
                        >
                          {file.type}
                        </motion.p>

                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                        >
                          modifié le{" "}
                          {new Date(file.lastModified).toLocaleDateString()}
                        </motion.p>
                      </div>
                    </motion.div>

                    <DeleteButton
                      onDelete={() => handleRemoveFile(idx)}
                      isDeleting={deletingIndex === idx}
                      onHoverStart={() => setHoveredIndex(idx)}
                      onHoverEnd={() => setHoveredIndex(null)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
