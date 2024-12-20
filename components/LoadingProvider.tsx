"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface LoadingContextType {
  registerLoadingComponent: () => string;
  componentLoaded: (id: string) => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(
    new Set()
  );

  const registerLoadingComponent = useCallback(() => {
    const id = Math.random().toString(36).substring(7);
    setLoadingComponents((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
    return id;
  }, []);

  const componentLoaded = useCallback((id: string) => {
    setLoadingComponents((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const isLoading = loadingComponents.size > 0;

  return (
    <LoadingContext.Provider
      value={{ registerLoadingComponent, componentLoaded, isLoading }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
