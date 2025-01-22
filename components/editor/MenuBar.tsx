import { useCallback } from 'react';

export const MenuBar = ({ editor }: { editor: any }) => {
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Échec de l'upload");

        const data = await response.json();
        editor.chain().focus().setImage({ src: data.url }).run();
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
          className={`p-2 rounded ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
          title="Gras"
        >
          <i className="fas fa-bold"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
          title="Italique"
        >
          <i className="fas fa-italic"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${editor.isActive("underline") ? "bg-gray-200" : ""}`}
          title="Souligné"
        >
          <i className="fas fa-underline"></i>
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
          className={`p-2 rounded ${editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""}`}
          title="Aligner à gauche"
        >
          <i className="fas fa-align-left"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""}`}
          title="Centrer"
        >
          <i className="fas fa-align-center"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded ${editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""}`}
          title="Aligner à droite"
        >
          <i className="fas fa-align-right"></i>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 w-full">
        {/* Listes */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}
          title="Liste à puces"
        >
          <i className="fas fa-list-ul"></i>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded ${editor.isActive("orderedList") ? "bg-gray-200" : ""}`}
          title="Liste numérotée"
        >
          <i className="fas fa-list-ol"></i>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Couleurs */}
        <input
          type="color"
          onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 p-1 rounded"
          title="Couleur du texte"
        />

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        {/* Autres outils */}
        <button
          onClick={() => {
            const url = window.prompt("URL du lien:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded ${editor.isActive("link") ? "bg-gray-200" : ""}`}
          title="Insérer un lien"
        >
          <i className="fas fa-link"></i>
        </button>

        {/* Upload d'image */}
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