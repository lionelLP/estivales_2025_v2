"use client";

import { useState } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Newspaper } from "lucide-react";
import Image from "next/image";
import ArticleEditor from "@/components/editor/ArticleEditor";
import Link from "next/link";

export default function PressePage() {
  const [items, setItems] = useState([
    /* vos items actuels */
  ]);
  const [showEditor, setShowEditor] = useState(false);

  const handleSaveArticle = (article: any) => {
    const position = items.length;
    const rowIndex = Math.floor(position / 2);
    const isFirstInRow = position % 2 === 0;
    const isEvenRow = rowIndex % 2 === 0;

    const isFullWidth = isEvenRow ? isFirstInRow : !isFirstInRow;

    const newItem = {
      title: (
        <div className="line-clamp-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {article.title}
        </div>
      ),
      description: (
        <div className="relative">
          <div className="line-clamp-2 font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
            {article.description}
          </div>
          {article.description.length > (isFullWidth ? 150 : 100) && (
            <Link
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-bleu-fonce dark:text-bleu-clair hover:underline inline-block"
            >
              Voir plus
            </Link>
          )}
        </div>
      ),
      header: (
        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <div className="relative w-full h-40">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </Link>
      ),
      className: `${
        isFullWidth ? "md:col-span-2" : "md:col-span-1"
      } hover:scale-[1.02] transition-transform cursor-pointer`,
      icon: article.favicon ? (
        <div className="relative w-4 h-4">
          <Image
            src={article.favicon}
            alt="Site favicon"
            width={16}
            height={16}
            className="rounded-sm"
          />
        </div>
      ) : (
        <Newspaper className="h-4 w-4 text-bleu-fonce dark:text-bleu-clair" />
      ),
      link: article.url,
      onClick: () => {
        if (article.url) {
          window.open(article.url, "_blank", "noopener,noreferrer");
        }
      },
    };

    setItems([newItem, ...items]);
    setShowEditor(false);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-left col-span-2">
              <h1 className="text-4xl font-bold mb-8 text-bleu-fonce dark:text-bleu-clair">
                Revues de presse & actualités
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowEditor(!showEditor)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-opacity-80 transition"
          >
            {showEditor ? "Fermer" : "Ajouter un article"}
          </button>
        </div>

        {showEditor && <ArticleEditor onSave={handleSaveArticle} />}

        <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[20rem]">
          {items.map((item, i) => (
            <BentoGridItem key={i} {...item} />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}
