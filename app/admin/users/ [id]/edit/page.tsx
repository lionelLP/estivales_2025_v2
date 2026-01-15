"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserData {
  id: number;
  username: string;
  email: string;
  userType: number;
}

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const { id } = use(params);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    userType: "1",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`/api/auth/users`);
        if (!res.ok) {
          throw new Error(
            "Impossible de récupérer les informations utilisateur"
          );
        }
        const data = await res.json();
        const idNum = Number(id);
        const user = (data.users || []).find((u: any) => u.id === idNum);
        if (!user) {
          setError("Utilisateur introuvable");
          return;
        }
        setFormData({
          username: user.username || "",
          email: user.email || "",
          userType: String(user.userType),
        });
      } catch (e) {
        setError((e as Error).message || "Erreur lors du chargement");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/auth/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          userType: Number(formData.userType),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Erreur lors de la mise à jour");
      }

      router.push("/admin/manage-users");
      router.refresh();
    } catch (e) {
      setError((e as Error).message || "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Modifier l'utilisateur</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div>
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="userType">Rôle</Label>
          <select
            id="userType"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="w-full rounded-lg border p-2 bg-white dark:bg-zinc-800">
            <option value="1">Utilisateur</option>
            <option value="0">Administrateur</option>
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2">
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
