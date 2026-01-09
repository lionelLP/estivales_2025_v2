"use client";

import parse from "html-react-parser";
import { useEffect, useState } from "react";

export default function About() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/about");
        if (response.ok) {
          const data = await response.json();
          setContent(data.html_content || "");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du contenu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative mb-12 mt-12">
        <h1 className="text-3xl font-bold text-center">À propos</h1>
      </div>
      <div className="prose prose-lg max-w-none">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-brou"></div>
          </div>
        ) : content ? (
          parse(content)
        ) : (
          <p className="text-center text-gray-500">Aucun contenu disponible</p>
        )}
      </div>
    </div>
  );
}
