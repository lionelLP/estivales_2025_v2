import type { Metadata } from "next";
import RegisterForm from "./register";

export const metadata: Metadata = {
  title: "Inscription | Estivle de Brou",
};

export default function MetaPage() {
  return <RegisterForm />;
}
