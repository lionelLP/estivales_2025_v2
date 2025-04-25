import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuthentication() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({
          ...data.user,
          userType: Number(data.user.userType),
        });
        router.push(data.user.userType === 0 ? "/" : "/");
      } else {
        setError(data.message || "Erreur lors de la connexion");
      }
    } catch (err) {
      console.error("Exception lors de la connexion:", err);
      setError("Une erreur s'est produite lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.ok) {
        setUser(null);
        router.push("/login");
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        router.push("/");
      } else {
        setError(data.message || "Erreur lors de l'inscription");
      }
    } catch {
      setError("Une erreur s'est produite lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return { login, logout, register, isLoading, error };
}
