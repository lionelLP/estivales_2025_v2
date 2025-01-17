"use client";

import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { useLoading } from "@/contexts/LoadingContext";
import { Edit, Newspaper, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Article {
  id: number;
  title: string;
  link: string;
  content: string;
  Creation_article: string;
  image: string;
  favicon?: string;
  url?: string;
  description?: string;
  publishDate?: string;
}

interface BentoGridItemType {
  id: number;
  title: JSX.Element;
  description: JSX.Element;
  header: JSX.Element;
  className: string;
  icon: JSX.Element;
  link: string;
  onClick: () => void;
}

export default function PressePage() {
  const [items, setItems] = useState<BentoGridItemType[]>([]);
  const { registerLoadingComponent, componentLoaded } = useLoading();
  const router = useRouter();

  useEffect(() => {
    const loadingId = registerLoadingComponent();

    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/articles");
        if (response.ok) {
          const articles = await response.json();
          const formattedItems = articles.map((article: Article, index: number) =>
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

    return () => {
      componentLoaded(loadingId);
    };
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
      id: article.id,
      title: (
        <div className="line-clamp-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {article.title}
        </div>
      ),
      description: (
        <div className="relative">
          <div className="line-clamp-2 font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
            {article.content}
          </div>
          <div className="flex justify-between items-center mt-2">
            <div>
              {article.content.length > (isLarge ? 150 : 100) && (
                <Link
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-bleu-fonce dark:text-bleu-clair hover:underline inline-block"
                >
                  Voir plus
                </Link>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/news/edit/${article.id}`);
                }}
                className="p-1 text-bleu-fonce hover:text-bleu-clair transition-colors"
                title="Modifier"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm(
                      "Voulez-vous vraiment supprimer cet article ?"
                    )
                  ) {
                    handleDeleteArticle(article.id);
                  }
                }}
                className="p-1 text-rouge hover:text-rouge/80 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ),
      header: (
        <Link
          href={article.link}
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

  const handleDeleteArticle = async (articleId: number) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== articleId)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
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
              <div className="flex justify-end">
                <Link
                  href="/admin/news/add"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <Newspaper className="w-5 h-5 mr-2" />
                  Ajouter une revue de presse
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[20rem]">
          {items.map((item, i) => (
            <BentoGridItem key={i} {...item} />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}
