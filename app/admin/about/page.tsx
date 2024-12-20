"use client";

import AdminLayout from "@/app/Layouts/AdminLayout";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Chargement de l&apos;éditeur...</p>,
});

import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
    ["link", "image"],
    ["clean"],
    ["code-block"],
  ],
};

export default function EditAbout() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "User",
    userType: "Administrateur",
  });

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/about", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html_content: content }),
      });

      if (response.ok) {
        router.push("/about");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout currentUser={currentUser}>
        <div>Chargement...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentUser={currentUser}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-12">
          Éditer la page À propos
        </h1>
        <div className="mb-6">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="h-[500px] mb-12"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push("/about")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
