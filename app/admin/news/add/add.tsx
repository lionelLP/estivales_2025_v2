"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ArticleEditor from "@/components/editor/ArticleEditor";

interface ArticleInput {
  title: string;
  url?: string;
  description: string;
  publishDate: string;
  image: string;
  favicon?: string;
}

export default function AddArticlePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSaveArticle = async (article: ArticleInput) => {
    try {
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: article.title,
          link: article.url || null,
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
        setError(errorData.error || "Erreur lors de la sauvegarde");
        return;
      }

      router.push("/admin/news");
    } catch {
      setError("Une erreur est survenue lors de la création de l'article");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Ajouter un nouvel article</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ArticleEditor onSave={handleSaveArticle} />
    </div>
  );
}
