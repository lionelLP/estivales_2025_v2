"use client";

import { FiltreEvenement } from "@/components/events/filtre-evenement";
import { RechercheEvenement } from "@/components/events/recherche-evenement";

export interface SearchFilterWrapperProps {
  mode: "past" | "toCome";
  onSearchCallback?: (query: string) => void;
  onFilterCallback?: (filters: { location: string; category: string }) => void;
  locations?: string[];
}

export function SearchFilterWrapper({
  mode,
  onSearchCallback,
  onFilterCallback,
  locations = [],
}: SearchFilterWrapperProps) {
  // Gestionnaires internes qui appellent les callbacks externes s'ils sont fournis
  const handleSearch = (query: string) => {
    if (onSearchCallback) {
      onSearchCallback(query);
    }
  };

  const handleFilter = (filters: { location: string; category: string }) => {
    if (onFilterCallback) {
      onFilterCallback(filters);
    }
  };

  return (
    <>
      <RechercheEvenement mode={mode} onSearch={handleSearch} />
      <FiltreEvenement
        mode={mode}
        onFilter={handleFilter}
        locations={locations}
      />
    </>
  );
}
