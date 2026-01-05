"use client";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { use } from "react";

export default function EditNews({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    content: "",
    Creation_article: "",
    image: "",
    favicon: "",
    is_published: 1,
    user_id: 1,
    event_id: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            title: data.title,
            link: data.link || "",
            content: data.content,
            Creation_article: data.Creation_article,
            image: data.image,
            favicon: data.favicon || "",
            is_published: data.is_published || 1,
            user_id: data.user_id || 1,
            event_id: data.event_id || null,
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
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`/api/articles/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          link: formData.link || null,
        }),
      });

      if (response.ok) {
        router.push("/admin/news");
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Error details:", error);
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
        {/* Image */}
        <div className="space-y-2">
          <label htmlFor="image" className="block text-sm font-medium">
            Image
          </label>
          {formData.image && (
            <div className="relative h-48 rounded-lg overflow-hidden mb-2">
              <Image
                src={formData.image}
                alt="Aperçu"
                fill
                className="object-cover"
              />
            </div>
          )}
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setFormData((prev) => ({
                    ...prev,
                    image: reader.result as string,
                  }));
                };
                reader.readAsDataURL(file);
              }
            }}
            className="w-full rounded-lg border p-2"
          />
        </div>

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

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/news")}
            className="px-4 py-2 text-gray-600 hover:text-neutral-900">
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
