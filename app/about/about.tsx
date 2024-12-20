"use client";

import parse from "html-react-parser";
import Link from "next/link";
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
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <Link
            href="/about/edit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Modifier
          </Link>
        </div>
      </div>
      <div className="prose prose-lg max-w-none">
        {content ? parse(content) : <p>Aucun contenu disponible</p>}
      </div>
    </div>
  );
}
