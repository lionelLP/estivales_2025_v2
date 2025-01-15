"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordField from "@/components/common/PasswordField";

export default function CreateUser() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    userType: "1", // 1 pour utilisateur standard, 0 pour admin
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.username,
          email: formData.email,
          password: formData.password,
          userType: parseInt(formData.userType),
        }),
      });

      if (response.ok) {
        router.push("/admin/users");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la création de l'utilisateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-12">
        Créer un nouvel utilisateur
      </h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
        )}

        {/* Nom d'utilisateur */}
        <div className="space-y-2">
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Mot de passe */}
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <PasswordField
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, password: value }))
            }
          />
        </div>

        {/* Type d'utilisateur */}
        <div className="space-y-2">
          <Label htmlFor="userType">Type d'utilisateur</Label>
          <select
            id="userType"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="w-full rounded-lg border p-2 bg-white dark:bg-zinc-800"
            required
          >
            <option value="1">Utilisateur standard</option>
            <option value="0">Administrateur</option>
          </select>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Création..." : "Créer l'utilisateur"}
          </button>
        </div>
      </form>
    </div>
  );
}
