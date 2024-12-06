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
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/partenaires/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/partenaires");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.message || "Erreur lors de la suppression du partenaire");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la suppression du partenaire");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">Modifier le partenaire</h1>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isDeleting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Suppression...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Supprimer</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
        )}

        {/* Nom */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Nom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg border p-3 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 transition"
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
            className="w-full rounded-lg border p-3 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Site web */}
        <div className="space-y-2">
          <label htmlFor="website_url" className="block text-sm font-medium">
            Site web
          </label>
          <input
            id="website_url"
            name="website_url"
            type="url"
            value={formData.website_url}
            onChange={handleChange}
            placeholder="https://"
            className="w-full rounded-lg border p-3 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium">Logo</label>
          {currentLogoUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Logo actuel :</p>
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                <img 
                  src={currentLogoUrl} 
                  alt="Logo actuel" 
                  className="object-cover w-full h-full"
                />
              </div>
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
        <div className="space-y-4">
          <label className="block text-sm font-medium">Bannière</label>
          {currentBannerUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Bannière actuelle :</p>
              <div className="relative h-96 w-full rounded-lg overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${currentBannerUrl})` }}
                />
                <div className="absolute inset-0 bg-black/30"></div>
              </div>
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

        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? "Modification..." : "Modifier le partenaire"}
          </button>
        </div>
      </form>
    </div>
  );
}