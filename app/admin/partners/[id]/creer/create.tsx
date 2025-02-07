"use client";

import { FileUpload } from "@/components/common/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreatePartner() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website_url: "",
  });
  const [logo, setLogo] = useState<File[]>([]);
  const [banner, setBanner] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (logo.length === 0 || banner.length === 0) {
      setError("Le logo et la bannière sont requis");
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("website_url", formData.website_url);
    formDataToSend.append("logo", logo[0]);
    formDataToSend.append("banner", banner[0]);

    try {
      const response = await fetch("/api/partenaires", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        router.push("/partenaires");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.message || "Une erreur est survenue");
      }
    } catch (err: Error | unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la création du partenaire"
      );
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold text-center mb-12">
        Ajouter un partenaire
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
        )}

        {/* Nom */}
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border p-3 bg-gray-50 dark:bg-zinc-800 shadow-sm focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition dark:text-white"
          />
        </div>

        {/* Site web */}
        <div className="space-y-2">
          <Label htmlFor="website_url">Site web</Label>
          <Input
            id="website_url"
            type="url"
            name="website_url"
            value={formData.website_url}
            onChange={handleChange}
            placeholder="https://"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-4">
          <Label>Logo</Label>
          <FileUpload
            onChange={(files) => setLogo(files)}
            maxFiles={1}
            accept="image/*"
            multiple={false}
          />
          <p className="text-sm text-gray-500">
            Format recommandé : PNG ou JPG, taille maximale : 2MB
          </p>
        </div>

        {/* Banner Upload */}
        <div className="space-y-2">
          <Label>Bannière</Label>
          <FileUpload
            onChange={(files) => setBanner(files)}
            maxFiles={1}
            accept="image/*"
            multiple={false}
          />
          <p className="text-sm text-gray-500">
            Format recommandé : 1920x1080px, taille maximale : 5MB
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-neutral-900 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Création..." : "Créer le partenaire"}
          </button>
        </div>
      </form>
    </div>
  );
}
