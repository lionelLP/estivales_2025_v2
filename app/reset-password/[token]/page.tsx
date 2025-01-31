"use client";

import DisableShinyButton from "@/components/common/DisableShinyButton";
import PasswordField from "@/components/common/PasswordField";
import ShinyButton from "@/components/magicui/shiny-button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPassword({
  params,
}: {
  params: { token: string };
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const isFormValid =
    password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, password }),
      });

      const data = await response.json();
      setMessage(data.message);
      setIsSuccess(response.ok);

      if (response.ok) {
        // Redirect to login page after 2 seconds on success
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setMessage("Une erreur est survenue");
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-dark-mode-2 border border-neutral-300 dark:border-neutral-800 shadow-lg mt-32">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 text-center">
        Réinitialisation du mot de passe
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 text-center">
        Veuillez entrer votre nouveau mot de passe
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <PasswordField
            onChange={(value) => setPassword(value)}
            className="focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <PasswordField
            onChange={(value) => setConfirmPassword(value)}
            className="focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
          />
        </div>

        {message && (
          <p
            className={`text-sm mb-4 text-center ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {isFormValid ? (
          <ShinyButton
            text={
              isSubmitting ? "MISE À JOUR..." : "RÉINITIALISER LE MOT DE PASSE"
            }
            className="w-full"
            type="submit"
            disabled={isSubmitting}
          />
        ) : (
          <DisableShinyButton
            text="RÉINITIALISER LE MOT DE PASSE"
            className="w-full"
          />
        )}
      </form>
    </div>
  );
}
