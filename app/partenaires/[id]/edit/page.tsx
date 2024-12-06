"use client";

import { FileUpload } from "@/components/common/file-upload";
import { Partner } from "@/lib/types/partner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditPartner({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website_url: "",
  });
  const [logo, setLogo] = useState<File[]>([]);
  const [banner, setBanner] = useState<File[]>([]);
  const [currentLogoUrl, setCurrentLogoUrl] = useState("");
  const [currentBannerUrl, setCurrentBannerUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const response = await fetch(`/api/partenaires/${params.id}`);
        if (response.ok) {
          const partner: Partner = await response.json();
          setFormData({
            name: partner.name,
            description: partner.description || "",
            website_url: partner.website_url || "",
          });
          setCurrentLogoUrl(partner.logo_url);
          setCurrentBannerUrl(partner.banner_url);
        } else {
          setError("Erreur lors de la récupération du partenaire");
        }
      } catch (err) {
        setError("Erreur lors de la récupération du partenaire");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartner();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("website_url", formData.website_url);
    
    if (logo.length > 0) {
      formDataToSend.append("logo", logo[0]);
    }
    if (banner.length > 0) {
      formDataToSend.append("banner", banner[0]);
    }

    try {
      const response = await fetch(`/api/partenaires/${params.id}`, {
        method: "PUT",
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
      setError("Une erreur est survenue lors de la modification du partenaire");
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
      <h1 className="text-2xl font-bold mb-6">Modifier le partenaire</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
        )}

        {/* Form fields referenced from create page */}
        ```typescript:app/partenaires/creer/page.tsx
        startLine: 76
        endLine: 121
        ```

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Logo</label>
          {currentLogoUrl && (
            <div className="mb-2">
              <p className="text-sm text-gray-500 mb-2">Logo actuel :</p>
              <img src={currentLogoUrl} alt="Logo actuel" className="h-16 w-16 object-cover rounded-full" />
            </div>
          )}
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
          {currentBannerUrl && (
            <div className="mb-2">
              <p className="text-sm text-gray-500 mb-2">Bannière actuelle :</p>
              <img src={currentBannerUrl} alt="Bannière actuelle" className="w-full h-32 object-cover rounded-lg" />
            </div>
          )}
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
            {isSubmitting ? "Modification..." : "Modifier le partenaire"}
          </button>
        </div>
      </form>
    </div>
  );
} 