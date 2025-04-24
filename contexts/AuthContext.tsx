"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  name?: string;
  userType: number;
} | null;

type AuthContextType = {
  user: User;
  setUser: (user: User) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Vérification de l'authentification...");
      try {
        console.log("Envoi de la requête à /api/auth/check");
        const response = await fetch("/api/auth/check", {
          credentials: "include",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        console.log("Réponse reçue:", response.status);

        if (response.ok) {
          const userData = await response.json();
          console.log("Données utilisateur reçues:", userData);
          setUser(userData);
        } else {
          console.log("Réponse non valide, status:", response.status);
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur de vérification d'authentification:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}
