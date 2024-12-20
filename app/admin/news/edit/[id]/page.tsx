"use client";

import { useLoading } from "@/contexts/LoadingContext";
import { Newspaper } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Article {
  id: number;
  title: string;
  content: string;
  link: string;
  Creation_article: string;
  image: string;
  favicon: string;
}

export default function EditArticlePage() {
  const [article, setArticle] = useState<Article | null>(null);
  const { registerLoadingComponent, componentLoaded } = useLoading();
  const params = useParams();

  useEffect(() => {
    const loadingId = registerLoadingComponent();

    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setArticle(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'article:", error);
      } finally {
        componentLoaded(loadingId);
      }
    };

    fetchArticle();

    return () => {
      componentLoaded(loadingId);
    };
  }, [params.id]);

  if (!article) {
    return <div>Chargement...</div>;
  }

  const formattedDate = new Date(article.Creation_article).toLocaleDateString(
    "fr-FR",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="relative w-full h-64 mb-6">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 mb-4">
            {article.favicon ? (
              <div className="relative w-6 h-6">
                <Image
                  src={article.favicon}
                  alt="Site favicon"
                  width={24}
                  height={24}
                  className="rounded-sm"
                />
              </div>
            ) : (
              <Newspaper className="h-6 w-6 text-bleu-fonce dark:text-bleu-clair" />
            )}
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {formattedDate}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-bleu-fonce dark:text-bleu-clair">
            {article.title}
          </h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300">
              {article.content}
            </p>
          </div>

          {article.link && (
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Lire l'article original
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
