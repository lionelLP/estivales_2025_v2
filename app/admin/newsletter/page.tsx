"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MenuBar } from "@/components/editor/MenuBar";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

export default function NewsletterPage() {
  const [isSending, setIsSending] = useState(false);
  const [subject, setSubject] = useState("");
  const router = useRouter();

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
      TextStyle,
      Color,
    ],
    content: "",
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

        <div className="mb-6 border rounded-lg">
          <MenuBar editor={editor} />
          <EditorContent editor={editor} className="min-h-[500px] p-4 prose max-w-none" />
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
