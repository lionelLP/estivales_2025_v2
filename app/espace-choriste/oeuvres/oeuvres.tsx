"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileText,
  Headphones,
  Search,
  Music2,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

type OeuvreWithGroups = Oeuvre & {
  partitions: OeuvreResource[];
  audios: OeuvreResource[];
};

function getResourceLabel(resource: OeuvreResource) {
  if (resource.title?.trim()) return resource.title;
  const parts = resource.url.split("/");
  return parts[parts.length - 1] || "Ressource";
}

function shouldTruncateDescription(description: string | null) {
  if (!description?.trim()) return false;
  return description.trim().length > 300;
}

function MetadataBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
      {children}
    </span>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white">
      <header className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2">
        <span className="text-neutral-500">{icon}</span>
        <h3 className="text-sm font-semibold text-neutral-800">{title}</h3>
      </header>
      <div className="flex flex-1 flex-col px-3 py-2.5">{children}</div>
    </section>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 text-center text-sm text-neutral-500">
      {children}
    </div>
  );
}

function ResourceActionLink({
  href,
  primary = false,
  download = false,
  children,
}: {
  href: string;
  primary?: boolean;
  download?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={download ? undefined : "_blank"}
      rel={download ? undefined : "noopener noreferrer"}
      download={download}
      className={
        primary
          ? "inline-flex h-7 items-center rounded-full border border-red-brou/15 bg-red-brou/8 px-2.5 text-[11px] font-medium text-red-brou transition-colors hover:bg-red-brou/12"
          : "inline-flex h-7 items-center rounded-full border border-neutral-200 bg-white px-2.5 text-[11px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
      }
    >
      {children}
    </a>
  );
}

function DescriptionBlock({
  oeuvreId,
  description,
  expanded,
  onToggle,
}: {
  oeuvreId: number;
  description: string | null;
  expanded: boolean;
  onToggle: (oeuvreId: number) => void;
}) {
  const isLong = shouldTruncateDescription(description);

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1">
        <div
          className={`whitespace-pre-line text-sm leading-5 text-neutral-700 ${
            isLong && !expanded ? "max-h-24 overflow-hidden" : ""
          }`}
        >
          {description || "Aucune information complementaire."}
        </div>
        {isLong && !expanded ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/95 to-transparent" />
        ) : null}
      </div>

      {isLong ? (
        <button
          type="button"
          onClick={() => onToggle(oeuvreId)}
          className="mt-2 inline-flex w-fit items-center gap-1 text-xs font-medium text-neutral-600 transition-colors hover:text-red-brou"
        >
          {expanded ? (
            <>
              Voir moins
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Voir plus
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}

function PartitionList({ resources }: { resources: OeuvreResource[] }) {
  if (resources.length === 0) {
    return <EmptyState>Aucune partition disponible.</EmptyState>;
  }

  return (
    <div
      className={`flex flex-1 flex-col gap-1.5 ${
        resources.length > 2 ? "md:max-h-[9.5rem] md:overflow-y-auto md:pr-1" : ""
      }`}
    >
      {resources.map((resource) => (
        <article
          key={resource.id}
          className="rounded-md border border-neutral-200 bg-neutral-50/70 px-2.5 py-2"
        >
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-neutral-200 bg-white p-1.5 text-neutral-500">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-neutral-900">
                {getResourceLabel(resource)}
              </p>
            </div>
            <p className="hidden text-[11px] text-neutral-500 sm:block">
              {resource.source_kind === "file" ? "PDF" : "Lien"}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <ResourceActionLink href={resource.url} primary>
                Ouvrir
              </ResourceActionLink>
              {resource.source_kind === "file" ? (
                <ResourceActionLink href={resource.url} download>
                  <span className="inline-flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Telecharger
                  </span>
                </ResourceActionLink>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function AudioRow({ resource }: { resource: OeuvreResource }) {
  const canPreview =
    resource.source_kind === "file" ||
    (resource.mime_type?.startsWith("audio/") ?? false);

  return (
    <article className="rounded-md border border-neutral-200 bg-neutral-50/70 px-2.5 py-2">
      <div className="flex items-center gap-2">
        <div className="rounded-md border border-neutral-200 bg-white p-1.5 text-neutral-500">
          <Headphones className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-neutral-900">
            {getResourceLabel(resource)}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-1 md:flex">
          <ResourceActionLink href={resource.url} primary>
            Ouvrir
          </ResourceActionLink>
          <ResourceActionLink href={resource.url}>
            <span className="inline-flex items-center gap-1">
              <Download className="h-3 w-3" />
              Telecharger
            </span>
          </ResourceActionLink>
        </div>
      </div>

      <div className="mt-1.5 pl-8">
        {canPreview ? (
          <audio controls preload="none" className="h-8 w-full max-w-full">
            <source src={resource.url} type={resource.mime_type || undefined} />
            Votre navigateur ne supporte pas l&apos;audio.
          </audio>
        ) : (
          <p className="text-[11px] text-neutral-500">Apercu indisponible pour ce lien.</p>
        )}
        <div className="mt-1.5 flex items-center gap-1 md:hidden">
          <ResourceActionLink href={resource.url} primary>
            Ouvrir
          </ResourceActionLink>
          <ResourceActionLink href={resource.url}>
            <span className="inline-flex items-center gap-1">
              <Download className="h-3 w-3" />
              Telecharger
            </span>
          </ResourceActionLink>
        </div>
      </div>
    </article>
  );
}

function AudioList({ resources }: { resources: OeuvreResource[] }) {
  if (resources.length === 0) {
    return <EmptyState>Aucune musique de travail disponible.</EmptyState>;
  }

  return (
    <div
      className={`flex flex-1 flex-col gap-1.5 ${
        resources.length > 2 ? "md:max-h-[12rem] md:overflow-y-auto md:pr-1" : ""
      }`}
    >
      {resources.map((resource) => (
        <AudioRow key={resource.id} resource={resource} />
      ))}
    </div>
  );
}

function WorkCard({
  oeuvre,
  isOpen,
  onToggleOpen,
  expanded,
  onToggleDescription,
}: {
  oeuvre: OeuvreWithGroups;
  isOpen: boolean;
  onToggleOpen: (oeuvreId: number) => void;
  expanded: boolean;
  onToggleDescription: (oeuvreId: number) => void;
}) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => onToggleOpen(oeuvre.id)}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-neutral-50 sm:px-5"
      >
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight text-neutral-950 sm:text-xl">
            {oeuvre.title}
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {oeuvre.composer ? <MetadataBadge>{oeuvre.composer}</MetadataBadge> : null}
            <MetadataBadge>
              {oeuvre.partitions.length} partition{oeuvre.partitions.length > 1 ? "s" : ""}
            </MetadataBadge>
            <MetadataBadge>
              {oeuvre.audios.length} audio{oeuvre.audios.length > 1 ? "s" : ""}
            </MetadataBadge>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-neutral-200 bg-white p-2 text-neutral-500">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {isOpen ? (
        <div className="border-t border-neutral-100 px-4 py-4 sm:px-5">
          <div className="grid items-stretch gap-3 md:grid-cols-1 xl:grid-cols-3 xl:gap-3">
            <SectionCard title="Informations" icon={<FileText className="h-4 w-4" />}>
              <DescriptionBlock
                oeuvreId={oeuvre.id}
                description={oeuvre.description}
                expanded={expanded}
                onToggle={onToggleDescription}
              />
            </SectionCard>

            <SectionCard title="Partitions" icon={<FileText className="h-4 w-4" />}>
              <PartitionList resources={oeuvre.partitions} />
            </SectionCard>

            <SectionCard title="Musiques de travail" icon={<Music2 className="h-4 w-4" />}>
              <AudioList resources={oeuvre.audios} />
            </SectionCard>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function ChoristeOeuvresPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const hasChoristeSpaceAccess = user?.userType === 0 || user?.userType === 1;
  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedWorks, setExpandedWorks] = useState<number[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!hasChoristeSpaceAccess) {
      router.replace("/unauthorized");
    }
  }, [isLoading, hasChoristeSpaceAccess, user, router]);

  useEffect(() => {
    const fetchOeuvres = async () => {
      try {
        const response = await fetch("/api/oeuvres", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Erreur lors du chargement");
        }
        const data = await response.json();
        setOeuvres(data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        setError(message);
      } finally {
        setIsFetching(false);
      }
    };

    if (hasChoristeSpaceAccess) {
      fetchOeuvres();
    }
  }, [hasChoristeSpaceAccess]);

  const grouped = useMemo<OeuvreWithGroups[]>(() => {
    return oeuvres.map((oeuvre) => ({
      ...oeuvre,
      partitions: oeuvre.resources.filter((r) => r.resource_kind === "partition"),
      audios: oeuvre.resources.filter((r) => r.resource_kind === "audio"),
    }));
  }, [oeuvres]);

  const filteredOeuvres = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return grouped;

    return grouped.filter((oeuvre) => {
      const searchableText = [
        oeuvre.title,
        oeuvre.composer || "",
        oeuvre.description || "",
        ...oeuvre.partitions.map((resource) => getResourceLabel(resource)),
        ...oeuvre.audios.map((resource) => getResourceLabel(resource)),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [grouped, searchTerm]);

  const toggleDescription = (oeuvreId: number) => {
    setExpandedDescriptions((prev) =>
      prev.includes(oeuvreId) ? prev.filter((id) => id !== oeuvreId) : [...prev, oeuvreId]
    );
  };

  const toggleWork = (oeuvreId: number) => {
    setExpandedWorks((prev) =>
      prev.includes(oeuvreId) ? prev.filter((id) => id !== oeuvreId) : [...prev, oeuvreId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-red-brou" />
      </div>
    );
  }

  if (!user || !hasChoristeSpaceAccess) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-10 sm:px-6">
      <header className="mb-10 mt-8 border-b border-neutral-200 pb-6 sm:mt-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
          Espace prive choristes
        </p>
        <div className="mt-3 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            Oeuvres & partitions
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-[15px]">
            Retrouvez les consignes de travail, les partitions et les fichiers audio dans une
            interface plus claire et facile a parcourir.
          </p>
        </div>

        <div className="mt-5 max-w-md">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une oeuvre, un compositeur, un fichier..."
              className="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-red-brou/30 focus:ring-2 focus:ring-red-brou/10"
            />
          </label>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : isFetching ? (
        <div className="text-sm text-neutral-500">Chargement des oeuvres...</div>
      ) : filteredOeuvres.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
          {searchTerm.trim()
            ? "Aucun resultat pour cette recherche."
            : "Aucune oeuvre publiee pour le moment."}
        </div>
      ) : (
        <div className="space-y-8">
          {filteredOeuvres.map((oeuvre) => (
            <WorkCard
              key={oeuvre.id}
              oeuvre={oeuvre}
              isOpen={expandedWorks.includes(oeuvre.id)}
              onToggleOpen={toggleWork}
              expanded={expandedDescriptions.includes(oeuvre.id)}
              onToggleDescription={toggleDescription}
            />
          ))}
        </div>
      )}
    </div>
  );
}
