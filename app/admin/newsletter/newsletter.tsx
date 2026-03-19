"use client";

import { MenuBar } from "@/components/editor/MenuBar";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewsletterPage() {
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState("");
  const router = useRouter();

  const editor = useEditor({
    immediatelyRender: false,
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
        inline: true,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      // Optional: Log the HTML content to see the base64 images
      console.log(editor.getHTML());
    },
  });

  const handleSend = async () => {
    if (!subject.trim()) {
      alert("Veuillez saisir un sujet pour l'email");
      return;
    }

    if (!editor?.getHTML().trim()) {
      alert("Veuillez saisir le contenu de l'email");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject,
          content: editor?.getHTML(),
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi");
      }

      const data = await response.json();
      alert(`Email envoyé avec succès à ${data.sentCount} abonnés !`);
      router.push("/admin");
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      alert("Une erreur est survenue lors de l'envoi de la newsletter");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-12">
        Envoyer une newsletter
      </h1>

      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            Sujet de l&apos;email
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Saisissez le sujet de votre newsletter"
          />
        </div>

        <div className="mb-6 border rounded-lg shadow-sm">
          <MenuBar editor={editor} disableImage={true} />
          <EditorContent
            editor={editor}
            className="min-h-[600px] p-6 prose max-w-none"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 text-gray-600 hover:text-neutral-900"
          >
            Annuler
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSending ? "Envoi en cours..." : "Envoyer la newsletter"}
          </button>
        </div>
      </div>
    </div>
  );
}
