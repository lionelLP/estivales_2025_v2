import { createContext, useContext, useState, useEffect } from 'react';

type LoadingContextType = {
  setPageLoading: (loading: boolean) => void;
  registerLoadingComponent: () => number;
  componentLoaded: (id: number) => void;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingComponents, setLoadingComponents] = useState<Set<number>>(new Set());
  const [nextId, setNextId] = useState(0);

  const registerLoadingComponent = () => {
    const id = nextId;
    setNextId(prev => prev + 1);
    setLoadingComponents(prev => new Set(prev).add(id));
    return id;
  };

  const componentLoaded = (id: number) => {
    setLoadingComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  return (
    <LoadingContext.Provider value={{ 
      setPageLoading: () => {}, 
      registerLoadingComponent, 
      componentLoaded 
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};