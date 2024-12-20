"use client";

import ArticleEditor from "@/components/editor/ArticleEditor";
import { Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PressePage() {
  const [items, setItems] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/articles");
        if (response.ok) {
          const articles = await response.json();
          const formattedItems = articles.map((article: any, index: number) =>
            formatArticleToItem(article, index)
          );
          setItems(formattedItems);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des articles:", error);
      }
    };

    fetchArticles();
  }, []);

  const handleSaveArticle = async (article: any) => {
    try {
      console.log("Article à sauvegarder:", article); // Pour le debug

      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: article.title,
          link: article.url,
          content: article.description,
          Creation_article: article.publishDate,
          is_published: 1,
          user_id: 1,
          event_id: null,
          image: article.image,
          favicon: article.favicon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Erreur lors de la sauvegarde");
        throw new Error(errorData.error || "Erreur lors de la sauvegarde");
      }

      const data = await response.json();
      console.log("Réponse du serveur:", data);

      const newItem = formatArticleToItem(
        {
          title: article.title,
          link: article.url,
          content: article.description,
          Creation_article: article.publishDate,
          image: article.image,
          favicon: article.favicon,
        },
        0
      );

      setItems([newItem, ...items]);
      setSuccessMessage("Article ajouté avec succès !");

      // Effacer le message de succès après 3 secondes
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Erreur complète:", error);
      setErrorMessage("Une erreur est survenue lors de l'ajout de l'article");

      // Effacer le message d'erreur après 3 secondes
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  const formatArticleToItem = (article: any, index: number) => {
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
        <div className="line-clamp-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {article.title}
        </div>
      ),
      description: (
        <div className="relative">
          <div className="line-clamp-2 font-sans font-normal text-neutral-600 text-xs dark:text-neutral-300">
            {article.content}
          </div>
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
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="mb-6">
          <ArticleEditor onSave={handleSaveArticle} />
        </div>
      </div>
    </div>
  );
}
