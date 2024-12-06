"use client";

import { FileUpload } from "@/components/common/file-upload";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    } catch (err) {
      setError("Une erreur est survenue lors de la création du partenaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Créer un nouveau partenaire</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Nom */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Nom
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border p-2"
          />
        </div>

        {/* Site web */}
        <div className="space-y-2">
          <label htmlFor="website_url" className="block text-sm font-medium">
            Site web
          </label>
          <input
            id="website_url"
            type="url"
            name="website_url"
            value={formData.website_url}
            onChange={handleChange}
            className="w-full rounded-lg border p-2"
            placeholder="https://"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Logo</label>
          <FileUpload
            onChange={(files) => setLogo(files)}
            maxFiles={1}
            accept="image/*"
            multiple={false}
          />
          <p className="text-sm text-gray-500">Format recommandé : PNG ou JPG, taille maximale : 2MB</p>
        </div>

        {/* Banner Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Bannière</label>
          <FileUpload
            onChange={(files) => setBanner(files)}
            maxFiles={1}
            accept="image/*"
            multiple={false}
          />
          <p className="text-sm text-gray-500">Format recommandé : 1920x1080px, taille maximale : 5MB</p>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
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