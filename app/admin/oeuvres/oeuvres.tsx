"use client";

import UnauthorizedPage from "@/app/unauthorized/unauthorized";
import { getMediaUrl } from "@/lib/utils/media-utils";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type OeuvreResource = {
  id: number;
  oeuvre_id: number;
  resource_kind: "partition" | "audio";
  source_kind: "file" | "link";
  title: string | null;
  url: string;
  mime_type: string | null;
};

type Oeuvre = {
  id: number;
  title: string;
  composer: string | null;
  description: string | null;
  is_published: boolean;
  resources: OeuvreResource[];
};

type OeuvreForm = {
  title: string;
  composer: string;
  description: string;
  is_published: boolean;
};

type Mode = "idle" | "create" | "edit";
type ResourceEditorKind = "partition" | "audio" | null;
type ResourceInputMode = "link" | "file";

const EMPTY_FORM: OeuvreForm = {
  title: "",
  composer: "",
  description: "",
  is_published: true,
};

type User = {
  userType: number;
};

function formFromOeuvre(oeuvre: Oeuvre): OeuvreForm {
  return {
    title: oeuvre.title,
    composer: oeuvre.composer || "",
    description: oeuvre.description || "",
    is_published: Boolean(oeuvre.is_published),
  };
}

function resourceLabel(resource: OeuvreResource) {
  if (resource.title?.trim()) return resource.title;
  const chunks = resource.url.split("/");
  return chunks[chunks.length - 1] || resource.url;
}

export default function AdminOeuvresPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [resourceEditorKind, setResourceEditorKind] = useState<ResourceEditorKind>(null);
  const [form, setForm] = useState<OeuvreForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [partitionTitle, setPartitionTitle] = useState("");
  const [partitionUrl, setPartitionUrl] = useState("");
  const [partitionFile, setPartitionFile] = useState<File | null>(null);
  const [partitionInputMode, setPartitionInputMode] = useState<ResourceInputMode>("link");

  const [audioTitle, setAudioTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioInputMode, setAudioInputMode] = useState<ResourceInputMode>("link");

  const selectedOeuvre = useMemo(
    () => (selectedId ? oeuvres.find((item) => item.id === selectedId) || null : null),
    [oeuvres, selectedId]
  );

  const partitionResources = useMemo(
    () => selectedOeuvre?.resources.filter((r) => r.resource_kind === "partition") || [],
    [selectedOeuvre]
  );

  const audioResources = useMemo(
    () => selectedOeuvre?.resources.filter((r) => r.resource_kind === "audio") || [],
    [selectedOeuvre]
  );

  const clearResourceInputs = () => {
    setPartitionTitle("");
    setPartitionUrl("");
    setPartitionFile(null);
    setPartitionInputMode("link");
    setAudioTitle("");
    setAudioUrl("");
    setAudioFile(null);
    setAudioInputMode("link");
  };

  const selectOeuvre = (oeuvre: Oeuvre) => {
    setMode("edit");
    setSelectedId(oeuvre.id);
    setResourceEditorKind(null);
    setForm(formFromOeuvre(oeuvre));
    clearResourceInputs();
    setError(null);
  };

  const openResourceEditor = (oeuvre: Oeuvre, kind: Exclude<ResourceEditorKind, null>) => {
    setMode("idle");
    setSelectedId(oeuvre.id);
    setResourceEditorKind(kind);
    setForm(formFromOeuvre(oeuvre));
    clearResourceInputs();
    setError(null);
  };

  const startCreate = () => {
    setMode("create");
    setSelectedId(null);
    setResourceEditorKind(null);
    setForm(EMPTY_FORM);
    clearResourceInputs();
    setError(null);
  };

  const backToIdle = () => {
    setMode("idle");
    setSelectedId(null);
    setResourceEditorKind(null);
    setForm(EMPTY_FORM);
    clearResourceInputs();
    setError(null);
  };

  const loadOeuvres = async (nextId?: number | null) => {
    setIsFetching(true);
    try {
      const response = await fetch("/api/oeuvres?includeDrafts=true", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors du chargement des oeuvres");
      }

      const items = (data || []) as Oeuvre[];
      setOeuvres(items);

      if (items.length === 0) {
        setMode("idle");
        setSelectedId(null);
        setResourceEditorKind(null);
        setForm(EMPTY_FORM);
        return;
      }

      if (mode === "create") {
        return;
      }

      const targetId = nextId ?? selectedId;
      if (!targetId) {
        setMode("idle");
        return;
      }

      const target = items.find((item) => item.id === targetId);
      if (target) {
        setSelectedId(target.id);
        setForm(formFromOeuvre(target));
      } else {
        setMode("idle");
        setSelectedId(null);
        setResourceEditorKind(null);
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (response.ok) setCurrentUser(data);
      } catch (fetchError) {
        console.error("Erreur utilisateur:", fetchError);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUser?.userType === 0) {
      loadOeuvres();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const saveOeuvre = async () => {
    if (!form.title.trim()) {
      setError("Le titre de l'oeuvre est obligatoire.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        title: form.title.trim(),
        composer: form.composer.trim() || null,
        description: form.description.trim() || null,
        is_published: form.is_published,
      };

      if (mode === "edit" && selectedId) {
        const response = await fetch(`/api/oeuvres/${selectedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Erreur de mise a jour");
        await loadOeuvres(null);
        backToIdle();
      } else {
        const response = await fetch("/api/oeuvres", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Erreur de creation");
        await loadOeuvres(null);
        backToIdle();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteOeuvre = async () => {
    if (!selectedId) return;
    if (!window.confirm("Supprimer cette oeuvre et ses ressources ?")) return;

    try {
      const response = await fetch(`/api/oeuvres/${selectedId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Erreur de suppression");
      await loadOeuvres(null);
      backToIdle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const deleteOeuvreById = async (oeuvreId: number) => {
    if (!window.confirm("Supprimer cette oeuvre et ses ressources ?")) return;

    try {
      const response = await fetch(`/api/oeuvres/${oeuvreId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Erreur de suppression");

      if (selectedId === oeuvreId) {
        backToIdle();
      }
      await loadOeuvres(selectedId === oeuvreId ? null : selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  const addResource = async (
    resourceKind: "partition" | "audio",
    sourceKind: "file" | "link",
    title: string,
    url: string,
    mimeType?: string | null
  ) => {
    if (!selectedId) return;

    const response = await fetch(`/api/oeuvres/${selectedId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resource_kind: resourceKind,
        source_kind: sourceKind,
        title: title || null,
        url,
        mime_type: mimeType || null,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Erreur d'ajout");
  };

  const addPartitionLink = async () => {
    if (!partitionUrl.trim()) {
      setError("Ajoute une URL de partition.");
      return;
    }

    try {
      setIsUploading(true);
      await addResource("partition", "link", partitionTitle.trim(), partitionUrl.trim());
      setPartitionTitle("");
      setPartitionUrl("");
      await loadOeuvres(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadPartitionFile = async () => {
    if (!partitionFile) {
      setError("Selectionne un PDF de partition.");
      return;
    }

    try {
      setIsUploading(true);
      const body = new FormData();
      body.append("file", partitionFile);
      body.append("category", "partition");

      const uploadResponse = await fetch("/api/upload", { method: "POST", body });
      const uploadData = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok || !uploadData.path) {
        throw new Error(uploadData.error || "Erreur upload partition");
      }

      await addResource(
        "partition",
        "file",
        partitionFile.name,
        uploadData.path,
        partitionFile.type || "application/pdf"
      );

      setPartitionFile(null);
      await loadOeuvres(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsUploading(false);
    }
  };

  const addAudioLink = async () => {
    if (!audioUrl.trim()) {
      setError("Ajoute une URL audio.");
      return;
    }

    try {
      setIsUploading(true);
      await addResource("audio", "link", audioTitle.trim(), audioUrl.trim());
      setAudioTitle("");
      setAudioUrl("");
      await loadOeuvres(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadAudioFile = async () => {
    if (!audioFile) {
      setError("Selectionne un fichier audio.");
      return;
    }

    try {
      setIsUploading(true);
      const body = new FormData();
      body.append("files", audioFile);
      body.append("isOeuvre", "true");

      const uploadResponse = await fetch("/api/upload/audios", { method: "POST", body });
      const uploadData = await uploadResponse.json().catch(() => ({}));

      if (!uploadResponse.ok || !Array.isArray(uploadData.files) || uploadData.files.length === 0) {
        throw new Error(uploadData.error || "Erreur upload audio");
      }

      const fileInfo = uploadData.files[0];
      await addResource(
        "audio",
        "file",
        audioFile.name,
        fileInfo.url,
        audioFile.type || "audio/mpeg"
      );

      setAudioFile(null);
      await loadOeuvres(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteResource = async (resourceId: number) => {
    if (!window.confirm("Supprimer cette ressource ?")) return;

    try {
      const response = await fetch(`/api/oeuvres/resources/${resourceId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Erreur de suppression");
      await loadOeuvres(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  if (isLoadingUser) return <div>Chargement...</div>;
  if (!currentUser || currentUser.userType !== 0) return <UnauthorizedPage />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des oeuvres choristes</h1>
          <p className="text-sm text-muted-foreground">
            Gere les oeuvres, partitions et musiques de travail.
          </p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une oeuvre
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-200">
                Titre
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-200">
                Compositeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-200">
                Partitions
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-200">
                Audios
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-200">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {isFetching ? (
              <tr>
                <td className="px-6 py-4 text-sm text-neutral-500" colSpan={6}>
                  Chargement des oeuvres...
                </td>
              </tr>
            ) : oeuvres.length === 0 ? (
              <tr>
                <td className="px-6 py-4 text-sm text-neutral-500" colSpan={6}>
                  Aucune oeuvre pour le moment.
                </td>
              </tr>
            ) : (
              oeuvres.map((oeuvre) => {
                const partitionsCount = oeuvre.resources.filter(
                  (r) => r.resource_kind === "partition"
                ).length;
                const audiosCount = oeuvre.resources.filter(
                  (r) => r.resource_kind === "audio"
                ).length;
                return (
                  <tr
                    key={oeuvre.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    <td className="px-6 py-4">
                      <div className="min-w-[220px]">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                          {oeuvre.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-200">
                      {oeuvre.composer || "Non renseigne"}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-200">
                      <button
                        type="button"
                        onClick={() => openResourceEditor(oeuvre, "partition")}
                        className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                      >
                        {partitionsCount} fichier{partitionsCount > 1 ? "s" : ""}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-200">
                      <button
                        type="button"
                        onClick={() => openResourceEditor(oeuvre, "audio")}
                        className="inline-flex items-center rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                      >
                        {audiosCount} fichier{audiosCount > 1 ? "s" : ""}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          oeuvre.is_published
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-100"
                        }`}
                      >
                        {oeuvre.is_published ? "Publiee" : "Brouillon"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => selectOeuvre(oeuvre)}
                          className="rounded-md px-2 py-1 text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          onClick={() => openResourceEditor(oeuvre, "partition")}
                          className="rounded-md px-2 py-1 text-slate-700 hover:bg-neutral-100 hover:text-slate-900 dark:hover:bg-neutral-800"
                        >
                          Partitions
                        </button>
                        <button
                          type="button"
                          onClick={() => openResourceEditor(oeuvre, "audio")}
                          className="rounded-md px-2 py-1 text-slate-700 hover:bg-neutral-100 hover:text-slate-900 dark:hover:bg-neutral-800"
                        >
                          Audios
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteOeuvreById(oeuvre.id)}
                          className="rounded-md px-2 py-1 text-red-600 hover:bg-red-50 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {mode === "idle" ? null : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={backToIdle} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {mode === "create" ? "Creer une oeuvre" : "Modifier l'oeuvre"}
              </h2>
              <button onClick={backToIdle} className="text-sm text-neutral-600 hover:text-neutral-900">
                Fermer
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-neutral-700 dark:text-neutral-200">
                Titre *
                <input
                  value={form.title ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </label>

              <label className="text-sm text-neutral-700 dark:text-neutral-200">
                Compositeur
                <input
                  value={form.composer ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, composer: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </label>

              <label className="mt-6 inline-flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                <input
                  type="checkbox"
                  checked={Boolean(form.is_published)}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))}
                />
                Visible pour les choristes
              </label>

              <label className="text-sm text-neutral-700 dark:text-neutral-200 md:col-span-2">
                Informations de l'oeuvre
                <textarea
                  rows={5}
                  value={form.description ?? ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={saveOeuvre}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Enregistrement..." : mode === "create" ? "Creer" : "Enregistrer"}
              </button>

              {mode === "edit" ? (
                <button
                  onClick={deleteOeuvre}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer oeuvre
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {resourceEditorKind && selectedOeuvre ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={backToIdle} />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {resourceEditorKind === "partition" ? "Partitions" : "Audios"}
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Oeuvre : {selectedOeuvre.title}
                </p>
              </div>
              <button onClick={backToIdle} className="text-sm text-neutral-600 hover:text-neutral-900">
                Fermer
              </button>
            </div>

            {resourceEditorKind === "partition" ? (
              <div className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-700">
                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPartitionInputMode("link")}
                    className={`rounded-md px-3 py-2 text-sm ${
                      partitionInputMode === "link"
                        ? "bg-blue-600 text-white"
                        : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    }`}
                  >
                    Ajouter un lien
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartitionInputMode("file")}
                    className={`rounded-md px-3 py-2 text-sm ${
                      partitionInputMode === "file"
                        ? "bg-blue-600 text-white"
                        : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    }`}
                  >
                    Uploader un fichier
                  </button>
                </div>

                {partitionInputMode === "link" ? (
                  <div
                    key="partition-link"
                    className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                  >
                    <p className="mb-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Ajouter une partition via un lien
                    </p>
                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        value={partitionTitle ?? ""}
                        onChange={(e) => setPartitionTitle(e.target.value)}
                        placeholder="Titre du lien"
                        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                      />
                      <input
                        value={partitionUrl ?? ""}
                        onChange={(e) => setPartitionUrl(e.target.value)}
                        placeholder="https://..."
                        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                      />
                      <button
                        onClick={addPartitionLink}
                        disabled={isUploading}
                        className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        Enregistrer le lien
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key="partition-file"
                    className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                  >
                    <p className="mb-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Ajouter une partition en important un PDF
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => setPartitionFile(e.target.files?.[0] || null)}
                        className="max-w-xs text-sm"
                      />
                      <button
                        onClick={uploadPartitionFile}
                        disabled={isUploading}
                        className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        <Upload className="h-4 w-4" />
                        Importer le PDF
                      </button>
                    </div>
                  </div>
                )}

                <ul className="mt-4 space-y-2">
                  {partitionResources.length === 0 ? (
                    <li className="text-sm text-neutral-500">Aucune partition.</li>
                  ) : (
                    partitionResources.map((resource) => (
                      <li
                        key={resource.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
                      >
                        <a
                          href={getMediaUrl(resource.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-blue-700 hover:underline"
                        >
                          {resourceLabel(resource)}
                        </a>
                        <button
                          onClick={() => deleteResource(resource.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-200 p-5 dark:border-neutral-700">
                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAudioInputMode("link")}
                    className={`rounded-md px-3 py-2 text-sm ${
                      audioInputMode === "link"
                        ? "bg-blue-600 text-white"
                        : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    }`}
                  >
                    Ajouter un lien
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioInputMode("file")}
                    className={`rounded-md px-3 py-2 text-sm ${
                      audioInputMode === "file"
                        ? "bg-blue-600 text-white"
                        : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                    }`}
                  >
                    Uploader un fichier
                  </button>
                </div>

                {audioInputMode === "link" ? (
                  <div
                    key="audio-link"
                    className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                  >
                    <p className="mb-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Ajouter un audio via un lien
                    </p>
                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        value={audioTitle ?? ""}
                        onChange={(e) => setAudioTitle(e.target.value)}
                        placeholder="Titre du lien"
                        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                      />
                      <input
                        value={audioUrl ?? ""}
                        onChange={(e) => setAudioUrl(e.target.value)}
                        placeholder="https://..."
                        className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                      />
                      <button
                        onClick={addAudioLink}
                        disabled={isUploading}
                        className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        Enregistrer le lien
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key="audio-file"
                    className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
                  >
                    <p className="mb-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Ajouter un audio en important un fichier
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                        className="max-w-xs text-sm"
                      />
                      <button
                        onClick={uploadAudioFile}
                        disabled={isUploading}
                        className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        <Upload className="h-4 w-4" />
                        Importer l'audio
                      </button>
                    </div>
                  </div>
                )}

                <ul className="mt-4 space-y-2">
                  {audioResources.length === 0 ? (
                    <li className="text-sm text-neutral-500">Aucune musique.</li>
                  ) : (
                    audioResources.map((resource) => (
                      <li
                        key={resource.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
                      >
                        <a
                          href={getMediaUrl(resource.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate text-blue-700 hover:underline"
                        >
                          {resourceLabel(resource)}
                        </a>
                        <button
                          onClick={() => deleteResource(resource.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Supprimer
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
