"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

type Choriste = {
  id: number;
  username: string;
  email: string;
  description?: string | null;
};

export default function ChoristesInfosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [choristes, setChoristes] = useState<Choriste[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.userType !== 1) {
      router.replace("/unauthorized");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const fetchChoristes = async () => {
      try {
        const response = await fetch("/api/choristes", {
          credentials: "include",
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Erreur lors du chargement");
        }
        const data = await response.json();
        setChoristes(data.users || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        setError(message);
      } finally {
        setIsFetching(false);
      }
    };

    if (user?.userType === 1) {
      fetchChoristes();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-brou"></div>
      </div>
    );
  }

  if (!user || user.userType !== 1) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-5 mt-5">
        <p className="text-xs uppercase tracking-widest text-neutral-500 text-center">
          Espace privé choristes
        </p>
        <h1 className="text-4xl font-bold text-center pt-8 mb-8 text-red-brou">
          Liste des choristes
        </h1>
        <p className="text-sm text-neutral-600 text-center">
          Coordonnees des membres (email et informations).
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        {error ? (
          <div className="px-6 py-4 text-sm text-red-600">{error}</div>
        ) : isFetching ? (
          <div className="px-6 py-4 text-sm text-neutral-500">
            Chargement des choristes...
          </div>
        ) : choristes.length === 0 ? (
          <div className="px-6 py-4 text-sm text-neutral-500">
            Aucun choriste trouvé.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Téléphone
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {choristes.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm text-neutral-900">
                    {c.username}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {c.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {c.description || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
