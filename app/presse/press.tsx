"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { useLoading } from "@/contexts/LoadingContext";
import { Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Article {
  title: string;
  content: string;
  Creation_article: string;
  favicon: string;
  image: string;
  link: string;
}

interface FormattedItem {
  title: React.ReactNode;
  description: React.ReactNode;
  header: React.ReactNode;
  className: string;
  icon: React.ReactNode;
  link: string;
  onClick: () => void;
}

export default function PressePage() {
  const [items, setItems] = useState<FormattedItem[]>([]);
  const { registerLoadingComponent, componentLoaded } = useLoading();

  useEffect(() => {
    const loadingId = registerLoadingComponent();

    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/articles");
        if (response.ok) {
          const articles = (await response.json()) as Article[];
          const formattedItems = articles.map(
            (article: Article, index: number) =>
              formatArticleToItem(article, index)
          );
          setItems(formattedItems);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des articles:", error);
      } finally {
        componentLoaded(loadingId);
      }
    };

    fetchArticles();
  }, []);

  const formatArticleToItem = (article: Article, index: number) => {
    const formattedDate = new Date(article.Creation_article).toLocaleDateString(
      "fr-FR",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

    const position = index;
    const rowIndex = Math.floor(position / 2);
    const isFirstInRow = position % 2 === 0;
    const isEvenRow = rowIndex % 2 === 0;

    const isLarge = isEvenRow ? isFirstInRow : !isFirstInRow;

    return {
      title: (
        <div className="line-clamp-3 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {article.title}
        </div>
      ),
      description: (
        <div className="flex flex-col h-full justify-between">
          <div className="line-clamp-2 font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300 mb-4">
            {article.content}
          </div>
          <div className="flex justify-between items-center">
            {article.content.length > (isLarge ? 150 : 100) && (
              <Link
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-bleu-fonce dark:text-bleu-clair hover:underline"
              >
                Voir plus
              </Link>
            )}
          </div>
        </div>
      ),
      header: (
        <Link
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <div className="relative w-full h-44">
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
        isLarge ? "md:col-span-2" : "md:col-span-1"
      } hover:scale-[1.02] transition-transform cursor-pointer`,
      icon: (
        <div className="flex items-center gap-2">
          {article.favicon ? (
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
          )}
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {formattedDate}
          </span>
        </div>
      ),
      link: article.link,
      onClick: () => {
        if (article.link) {
          window.open(article.link, "_blank", "noopener,noreferrer");
        }
      },
    };
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
      <div>
        <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[23rem]">
          {items.map((item, i) => (
            <BentoGridItem key={i} {...item} />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}
