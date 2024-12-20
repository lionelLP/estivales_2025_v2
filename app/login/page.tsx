import type { Metadata } from "next";
import LoginForm from "./login";

export const metadata: Metadata = {
  title: "Connexion | Estivales de Brou",
  description: "Connectez-vous à votre compte Estivales de Brou",
};

export default function Page() {
  return <LoginForm />;
}
