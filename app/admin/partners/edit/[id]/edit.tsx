/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { FileUpload } from "@/components/common/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Partner } from "@/lib/types/partner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface EditPartnerProps {
  params: {
    id: string;
  };
}

export default function EditPartner({ params }: EditPartnerProps) {
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
  const [showCropper, setShowCropper] = useState(false);
  const [logoToProcess, setLogoToProcess] = useState<File | null>(null);

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
        router.push("/partners");
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
        router.push("/partners");
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

  const handleLogoSelect = (files: File[]) => {
    if (files.length > 0) {
      setLogoToProcess(files[0]);
      setShowCropper(true);
    }
  };

  const handleCroppedLogo = (croppedBlob: Blob) => {
    const croppedFile = new File(
      [croppedBlob],
      logoToProcess?.name || "logo.png",
      {
        type: "image/png",
      }
    );
    setLogo([croppedFile]);
    setShowCropper(false);
    setLogoToProcess(null);
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
      <h1 className="text-3xl font-bold text-center mb-12">
        Modifier le partenaire
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
            name="name"
            type="text"
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
            name="website_url"
            type="url"
            value={formData.website_url}
            onChange={handleChange}
            placeholder="https://"
          />
        </div>

        {/* Logo Upload */}
        <div className="space-y-4">
          <Label>Logo</Label>
          {currentLogoUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Logo actuel :</p>
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={currentLogoUrl}
                  alt="Logo actuel"
                  width={100}
                  height={100}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}
          <FileUpload
            onChange={handleLogoSelect}
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
          {currentBannerUrl && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Bannière actuelle :</p>
              <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={currentBannerUrl}
                  alt="Bannière actuelle"
                  width={100}
                  height={100}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          )}
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

        <div className="flex justify-between space-x-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-red-600 hover:text-red-800 transition disabled:opacity-50"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </button>

          <div className="flex space-x-4">
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
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
