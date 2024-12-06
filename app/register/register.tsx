"use client";
import DisableShinyButton from "@/components/common/DisableShinyButton";
import PasswordField from "@/components/common/PasswordField";
import ShinyButton from "@/components/magicui/shiny-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthentication } from "@/hooks/useAuthentication";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const { register, isLoading, error } = useAuthentication();

  useEffect(() => {
    setIsFormValid(
      email.trim() !== "" &&
        password.trim() !== "" &&
        confirmPassword === password &&
        name.trim() !== ""
    );
  }, [email, password, confirmPassword, name]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;
    await register(email, password, name);
  };

  return (
    <div>
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-dark-mode-2 border border-neutral-300 dark:border-neutral-800 shadow-lg mt-32">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 text-center">
          Créer un compte
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 text-center">
          Inscrivez-vous pour accéder à toutes les fonctionnalités
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              placeholder="John Doe"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="email">Adresse mail</Label>
            <Input
              id="email"
              placeholder="votre-mail@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="password">Mot de passe</Label>
            <PasswordField
              onChange={(value) => setPassword(value)}
              className="focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <PasswordField
              onChange={(value) => setConfirmPassword(value)}
              className="focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
            />
          </div>

          <div className="flex items-center justify-between">
            {isFormValid ? (
              <ShinyButton
                text={isLoading ? "INSCRIPTION EN COURS..." : "S'INSCRIRE"}
                className="w-full"
                type="submit"
                disabled={isLoading}
              />
            ) : (
              <DisableShinyButton text="S'INSCRIRE" className="w-full" />
            )}
          </div>
        </form>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        <div className="text-center">
          <span className="text-neutral-600 dark:text-neutral-400">
            Déjà inscrit ?{" "}
          </span>
          <Link
            href="/login"
            className="text-bleu-fonce dark:text-bleu-clair font-medium underline dark:hover:text-blue-400 hover:text-bleu-clair"
          >
            Connectez-vous ici
          </Link>
        </div>
      </div>
    </div>
  );
}
