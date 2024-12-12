"use client";
import DisableShinyButton from "@/components/common/DisableShinyButton";
import PasswordField from "@/components/common/PasswordField";
import ShinyButton from "@/components/magicui/shiny-button";
import { cn } from "@/lib/utils";
import { IdCard } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AnimatedCheckbox from "../../components/common/AnimatedCheckbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuthentication } from "../../hooks/useAuthentication";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isRememberChecked, setIsRememberChecked] = useState(false);
  const { login, isLoading, error } = useAuthentication();

  useEffect(() => {
    setIsFormValid(email.trim() !== "" && password.trim() !== "");
  }, [email, password]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleRememberChange = (checked: boolean) => {
    setIsRememberChecked(checked);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;
    await login(email, password);
  };

  return (
    <div>
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-dark-mode border border-neutral-300 dark:border-neutral-800 shadow-lg mt-32">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 text-center">
          Se connecter
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 text-center">
          Veuillez vous connecter
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Adresse mail</Label>
            <Input
              id="email"
              placeholder="votre-mail@example.com"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Mot de passe</Label>
            <PasswordField
              onChange={handlePasswordChange}
              className="focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
            />
          </LabelInputContainer>
          <div className="flex items-center space-x-2 mb-6">
            <AnimatedCheckbox
              id="remember"
              name="remember"
              checked={isRememberChecked}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleRememberChange(e.target.checked)
              }
            />
            <Label htmlFor="remember">
              Se rappeler de cet appareil pendant 30 jours
            </Label>
          </div>
          <div className="flex items-center justify-between">
            {isFormValid ? (
              <ShinyButton
                text={isLoading ? "CONNEXION EN COURS..." : "SE CONNECTER"}
                className="w-full"
                type="submit"
                disabled={isLoading}
              />
            ) : (
              <DisableShinyButton text="SE CONNECTER" className="w-full" />
            )}
          </div>
        </form>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        <div className="flex flex-col space-y-4">
          <button
            className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-dark-mode dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
            type="button"
          >
            <IdCard className="text-black dark:text-white" />
            <span className="text-neutral-700 dark:text-neutral-300 text-sm">
              Identité numérique
            </span>
            <BottomGradient />
          </button>
        </div>

        {/* Texte pour s'inscrire */}
        <div className="mt-6 text-center flex flex-col gap-2">
          <div>
            <span className="text-neutral-600 dark:text-neutral-400">
              Pas de compte ?{" "}
            </span>
            <Link
              href="/register"
              className="text-bleu-fonce dark:text-bleu-clair font-medium underline dark:hover:text-blue-400 hover:text-bleu-clair"
            >
              Inscrivez-vous ici
            </Link>
          </div>

          <Link
            href="/forgot-password"
            className="text-sm text-bleu-fonce hover:text-bleu-clair dark:text-bleu-clair dark:hover:text-white"
          >
            Mot de passe oublié ?
          </Link>
        </div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-bleu-clair to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-bleu-fonce to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
