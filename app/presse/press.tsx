"use client";
import { useLoading } from "@/contexts/LoadingContext";
import { useEffect, useState } from "react";

export default function PressePage() {
  const [items, setItems] = useState([]);
  const { registerLoadingComponent, componentLoaded } = useLoading();

  useEffect(() => {
    const loadingId = registerLoadingComponent();

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
      } finally {
        componentLoaded(loadingId);
      }
    };

    fetchArticles();

    return () => {
      componentLoaded(loadingId);
    };
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
        console.error("Erreur serveur:", errorData);
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
      setShowEditor(false);
    } catch (error) {
      console.error("Erreur complète:", error);
    }
  };

  const formatArticleToItem = (article: any, index: number) => {
    const formattedDate = new Date(article.Creation_article).toLocaleDateString(
      "fr-FR",
>>>>>>> main
      {
        url: "/homepage/banner/estivale3.jpg",
        width: 1200,
        height: 630,
        alt: "Actualités Estivales de Brou",
      },
    ],
  },
};

<<<<<<< HEAD
export { default } from "./press";
=======
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
        <BentoGrid className="max-w-7xl mx-auto md:auto-rows-[20rem]">
          {items.map((item, i) => (
            <BentoGridItem key={i} {...item} />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}