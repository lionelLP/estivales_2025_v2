"use client";

import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Strike from "@tiptap/extension-strike";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// Ajoutez cette fonction d'upload (à adapter selon votre API)
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Échec de l'upload");

    const data = await response.json();
    return data.url; // L'URL de l'image uploadée
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    throw error;
  }
};

// Composant pour la barre d'outils
const MenuBar = ({ editor }: { editor: any }) => {
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error("Erreur lors de l'upload de l'image:", error);
        alert("Erreur lors de l'upload de l'image");
      }
    },
    [editor]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 mb-4 border-b">
      <div className="flex flex-wrap gap-2 w-full border-b pb-2">
        {/* Styles de texte */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${
            editor.isActive("bold") ? "bg-gray-200" : ""
          }`}
          title="Gras"
        >
          <i className="fas fa-bold"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${
            editor.isActive("italic") ? "bg-gray-200" : ""
          }`}
          title="Italique"
        >
          <i className="fas fa-italic"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${
            editor.isActive("underline") ? "bg-gray-200" : ""
          }`}
          title="Souligné"
        >
          <i className="fas fa-underline"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded ${
            editor.isActive("strike") ? "bg-gray-200" : ""
          }`}
          title="Barré"
        >
          <i className="fas fa-strikethrough"></i>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Titres */}
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            level
              ? editor.chain().focus().toggleHeading({ level }).run()
              : editor.chain().focus().setParagraph().run();
          }}
          className="p-2 rounded border"
          value={
            editor.isActive("heading", { level: 1 })
              ? "1"
              : editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
              ? "3"
              : "0"
          }
        >
          <option value="0">Paragraphe</option>
          <option value="1">Titre 1</option>
          <option value="2">Titre 2</option>
          <option value="3">Titre 3</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Alignement */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded ${
            editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
          }`}
          title="Aligner à gauche"
        >
          <i className="fas fa-align-left"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded ${
            editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
          }`}
          title="Centrer"
        >
          <i className="fas fa-align-center"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded ${
            editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
          }`}
          title="Aligner à droite"
        >
          <i className="fas fa-align-right"></i>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 w-full">
        {/* Listes */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${
            editor.isActive("bulletList") ? "bg-gray-200" : ""
          }`}
          title="Liste à puces"
        >
          <i className="fas fa-list-ul"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${
            editor.isActive("orderedList") ? "bg-gray-200" : ""
          }`}
          title="Liste numérotée"
        >
          <i className="fas fa-list-ol"></i>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Tableau */}
        <button
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className="p-2 rounded hover:bg-gray-100"
          title="Insérer un tableau"
        >
          <i className="fas fa-table"></i>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Couleurs */}
        <input
          type="color"
          onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 p-1 rounded"
          title="Couleur du texte"
        />
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-2 rounded ${
            editor.isActive("highlight") ? "bg-gray-200" : ""
          }`}
          title="Surligner"
        >
          <i className="fas fa-highlighter"></i>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Autres outils */}
        <button
          onClick={() => {
            const url = window.prompt("URL du lien:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded ${
            editor.isActive("link") ? "bg-gray-200" : ""
          }`}
          title="Insérer un lien"
        >
          <i className="fas fa-link"></i>
        </button>

        {/* Nouveau bouton pour l'upload d'image */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="p-2 rounded hover:bg-gray-100 cursor-pointer flex items-center gap-2"
            title="Insérer une image"
          >
            <i className="fas fa-image"></i>
            <span className="text-sm">Ajouter une image</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default function EditAbout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "User",
    userType: "Administrateur",
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Strike,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: "",
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("/api/about");
        if (response.ok) {
          const data = await response.json();
          editor?.commands.setContent(data.html_content || "");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du contenu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (editor) {
      fetchContent();
    }
  }, [editor]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/about", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html_content: editor?.getHTML() }),
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-12">
        Éditer la page À propos
      </h1>
      <div className="mb-6 border rounded-lg">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} className="min-h-[500px] p-4" />
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
  );
}
