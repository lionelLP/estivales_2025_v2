"use client";

import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditNews({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    content: "",
    image: "",
    favicon: "",
    Creation_article: new Date().toISOString().slice(0, 16),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          const creationDate = new Date(data.Creation_article)
            .toISOString()
            .slice(0, 16);
          setFormData({
            ...data,
            Creation_article: creationDate,
          });
        } else {
          setError("Article non trouvé");
        }
      } catch {
        setError("Erreur lors de la récupération de l'article");
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/articles/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/news");
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la mise à jour");
      }
    } catch {
      setError("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Modifier l&apos;article</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Titre */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Titre
          </label>
          <Input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* Lien */}
        <div className="space-y-2">
          <label htmlFor="link" className="block text-sm font-medium">
            Lien de l&apos;article
          </label>
          <Input
            id="link"
            name="link"
            type="url"
            value={formData.link}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border p-2"
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label htmlFor="image" className="block text-sm font-medium">
            URL de l&apos;image
          </label>
          <Input
            id="image"
            name="image"
            type="url"
            value={formData.image}
            onChange={handleChange}
          />
        </div>

        {/* Favicon URL */}
        <div className="space-y-2">
          <label htmlFor="favicon" className="block text-sm font-medium">
            URL du favicon
          </label>
          <Input
            id="favicon"
            name="favicon"
            type="url"
            value={formData.favicon}
            onChange={handleChange}
          />
        </div>

        {/* Date de création */}
        <div className="space-y-2">
          <label
            htmlFor="Creation_article"
            className="block text-sm font-medium"
          >
            Date de publication
          </label>
          <Input
            id="Creation_article"
            name="Creation_article"
            type="datetime-local"
            value={formData.Creation_article}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/news")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
