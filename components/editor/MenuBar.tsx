import { Editor } from "@tiptap/react";
import { useCallback } from "react";

interface MenuBarProps {
  editor: Editor | null;
  onImageUpload?: (file: File) => Promise<string>;
  disableImage?: boolean;
}

export const MenuBar = ({
  editor,
  onImageUpload,
  disableImage = false,
}: MenuBarProps) => {
  // Define an active class for all selected buttons
  const activeClass = "dark:bg-zinc-600 bg-zinc-200";

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        if (onImageUpload && editor) {
          const imageUrl = await onImageUpload(file);
          editor.chain().focus().setImage({ src: imageUrl }).run();
        }
      } catch (error) {
        console.error("Erreur lors de l'upload de l'image:", error);
        alert("Erreur lors de l'upload de l'image");
      }
    },
    [editor, onImageUpload]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 mb-4 border-b">
      <div className="flex flex-wrap gap-2 w-full border-b pb-2">
        {/* Text styles */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive("bold") ? activeClass : ""}`}
          title="Gras"
        >
          <i className="fas fa-bold"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive("italic") ? activeClass : ""}`}
          title="Italique"
        >
          <i className="fas fa-italic"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${editor.isActive("underline") ? activeClass : ""}`}
          title="Souligné"
        >
          <i className="fas fa-underline"></i>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Text alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: "left" }) ? activeClass : ""}`}
          title="Aligner à gauche"
        >
          <i className="fas fa-align-left"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: "center" }) ? activeClass : ""}`}
          title="Centrer"
        >
          <i className="fas fa-align-center"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: "right" }) ? activeClass : ""}`}
          title="Aligner à droite"
        >
          <i className="fas fa-align-right"></i>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 w-full">
        {/* Colors */}
        <input
          type="color"
          onInput={(e) =>
            editor
              .chain()
              .focus()
              .setColor((e.target as HTMLInputElement).value)
              .run()
          }
          className="w-8 h-8 p-1 rounded"
          title="Couleur du texte"
        />

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Additional tools */}
        <button
          onClick={() => {
            const url = window.prompt("URL du lien:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded ${editor.isActive("link") ? activeClass : ""}`}
          title="Insérer un lien"
        >
          <i className="fas fa-link"></i>
        </button>

        {/* Only show image upload if not disabled */}
        {!disableImage && (
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
        )}
      </div>
    </div>
  );
};
