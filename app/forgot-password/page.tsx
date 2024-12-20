'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ShinyButton from '@/components/magicui/shiny-button';
import DisableShinyButton from '@/components/common/DisableShinyButton';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message);
      setIsSuccess(response.ok);
      if (response.ok) {
        setEmail('');
      }
    } catch (error) {
      setMessage("Une erreur est survenue");
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-dark-mode-2 border border-neutral-300 dark:border-neutral-800 shadow-lg mt-32">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 text-center">
        Mot de passe oublié
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 text-center">
        Entrez votre adresse email pour recevoir un lien de réinitialisation
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
          />
        </div>

        {message && (
          <p className={`text-sm mb-4 text-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        {email ? (
          <ShinyButton
            text={isSubmitting ? "ENVOI EN COURS..." : "ENVOYER LE LIEN"}
            className="w-full"
            type="submit"
            disabled={isSubmitting}
          />
        ) : (
          <DisableShinyButton text="ENVOYER LE LIEN" className="w-full" />
        )}
      </form>
    </div>
  );
} 