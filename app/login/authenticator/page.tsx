import type { Metadata } from "next";
import AuthenticatorForm from "./authenticator";

export const metadata: Metadata = {
  title: "Authentification TOTP | Cabinet de Courtage Claude Maréchal",
};

export default function MetaPage() {
  return <AuthenticatorForm />;
}
