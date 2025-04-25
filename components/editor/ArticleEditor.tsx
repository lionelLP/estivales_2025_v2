import Image from "next/image";
import { useState } from "react";

interface ArticleMetadata {
  title: string;
  description: string;
  image: string;
  favicon?: string;
  url: string;
  publishDate: string;
}

interface ArticleEditorProps {
  onSave: (article: ArticleMetadata & { url: string }) => void;
}

export default function ArticleEditor({ onSave }: ArticleEditorProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [metadata, setMetadata] = useState<ArticleMetadata | null>(null);

  const fetchMetadata = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/extract-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Impossible d&apos;extraire les métadonnées");
      }

      const data = await response.json();
      setMetadata(data);
    } catch {
      setError("Erreur lors de l&apos;extraction des métadonnées");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (metadata) {
      onSave({ ...metadata, url });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-dark-mode rounded-xl shadow-lg">
      <div className="space-y-6">
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            URL de l&apos;article
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 rounded-lg border p-2 dark:bg-black/20"
              placeholder="https://..."
            />
            <button
              onClick={fetchMetadata}
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-opacity-80 transition disabled:opacity-50"
            >
              {isLoading ? "Chargement..." : "Extraire"}
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {metadata && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative h-48 rounded-lg overflow-hidden">
              <Image
                src={metadata.image}
                alt="Aperçu"
                fill
                className="object-cover"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Titre
              </label>
              <input
                type="text"
                id="title"
                value={metadata.title}
                onChange={(e) =>
                  setMetadata({ ...metadata, title: e.target.value })
                }
                className="w-full rounded-lg border p-2 dark:bg-black/20"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={metadata.description}
                onChange={(e) =>
                  setMetadata({ ...metadata, description: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border p-2 dark:bg-black/20"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-opacity-80 transition"
            >
              Enregistrer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
