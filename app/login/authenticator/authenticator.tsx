"use client";

import DisableShinyButton from "@/components/common/DisableShinyButton";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthenticatorForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [otpValue, setOtpValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const authState = sessionStorage.getItem("authState");
    if (!authState) {
      router.push("/login");
      return;
    }

    // Vérifier si l'état d'authentification n'a pas expiré (15 minutes)
    const auth = JSON.parse(authState);
    const fifteenMinutes = 15 * 60 * 1000;
    if (Date.now() - auth.timestamp > fifteenMinutes) {
      sessionStorage.removeItem("authState");
      router.push("/login");
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  // Si non autorisé, ne rien afficher pendant la redirection
  if (!isAuthorized) {
    return null;
  }

  const handleOtpChange = async (value: string) => {
    setOtpValue(value);
    setError("");

    if (value.length === 6) {
      setIsLoading(true);
      try {
        const authState = JSON.parse(
          sessionStorage.getItem("authState") || "{}"
        );

        const response = await fetch("/api/2fa/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: value,
            userId: authState.userId,
          }),
        });

        const data = await response.json();

        if (response.ok && data.token) {
          // Nettoyer la session
          sessionStorage.removeItem("authState");

          // Définir le cookie avec le token JWT
          document.cookie = `token=${data.token}; path=/`;

          // Rediriger vers la page d'accueil
          router.push("/");
        } else {
          setError(data.message || "Code invalide");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        setError("Erreur lors de la vérification du code");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-1/2 mx-auto rounded-lg">
      <h1 className="text-4xl font-bold text-left mt-24 text-center mb-8">
        Authentification à deux facteurs
      </h1>
      <div className="flex flex-col items-center justify-center mt-8 border border-black dark:border-white rounded-[15px] p-4">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <p className="w-2/3 text-justify mt-2 mx-auto mb-8">
          Veuillez entrer le code à 6 chiffres généré par votre application
          d&apos;authentification.
        </p>
        <div className="mt-8">
          <InputOTP maxLength={6} value={otpValue} onChange={handleOtpChange}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        {otpValue.length < 6 && (
          <DisableShinyButton text="En attente du code..." className="mt-20" />
        )}
      </div>
    </div>
  );
}
