"use client";

import { MenuBar } from "@/components/editor/MenuBar";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
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
import { useEffect, useState } from "react";

// Keep the uploadImage function for image handling
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
    return data.url;
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    throw error;
  }
};

export default function EditAbout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4',
          },
        },
      }),
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
    editorProps: {
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          view.dispatch(view.state.tr.replaceSelectionWith(
            view.state.schema.nodes.paragraph.create()
          ));
          return true;
        }
        if (event.key === 'Enter' && event.shiftKey) {
          view.dispatch(view.state.tr.replaceSelectionWith(
            view.state.schema.nodes.hardBreak.create()
          ));
          return true;
        }
        return false;
      },
    },
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
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[500px]">
          <p>Chargement...</p>
        </div>
      ) : (
        <>
          <div className="mb-6 border rounded-lg">
            <MenuBar editor={editor} onImageUpload={uploadImage} />
            <EditorContent
              editor={editor}
              className="min-h-[500px] p-4 prose max-w-none"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.push("/about")}
              className="px-4 py-2 text-gray-600 hover:text-neutral-900"
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
        </>
      )}
    </div>
  );
}
