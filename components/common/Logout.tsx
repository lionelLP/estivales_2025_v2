import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface LogoutProps {
  children?: ReactNode;
  className?: string;
}

export default function Logout({ children, className }: LogoutProps) {
  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

    // Forcer un rafraîchissement de l'état de l'utilisateur
    await fetch("/api/user", { method: "GET" });

    router.push("/login");
  };

  return (
    <button onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}
