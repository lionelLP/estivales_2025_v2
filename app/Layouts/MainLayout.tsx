"use client";

import PageLoader from "@/components/common/PageLoader";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import DefaultLayout from "./DefaultLayout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    // Easter egg console log
    console.log(" ____            _   _                       ");
    console.log("| __ )  __ _ ___| |_(_) ___ _ __             ");
    console.log("|  _ \\ / _` / __| __| |/ _ \\ '_ \\            ");
    console.log("| |_) | (_| \\__ \\ |_| |  __/ | | |           ");
    console.log("|____/ \\__,_|___/\\__|_|\\___|_|_|_|           ");
    console.log("\\ \\   / /_ _| | ___ _ __ | |_(_)_ __         ");
    console.log(" \\ \\ / / _` | |/ _ \\ '_ \\| __| | '_ \\        ");
    console.log("  \\ V / (_| | |  __/ | | | |_| | | | |       ");
    console.log("   \\_/ \\__,_|_|\\___|_| |_|\\__|_|_| |_|       ");
    console.log("   / \\   _ __ | |_ ___ (_)_ __   ___         ");
    console.log("  / _ \\ | '_ \\| __/ _ \\| | '_ \\ / _ \\        ");
    console.log(" / ___ \\| | | | || (_) | | | | |  __/        ");
    console.log("/_/__ \\_\\_| |_|\\__\\___/|_|_| |_|\\___|_       ");
    console.log("| __ )  ___ _ __  (_) __ _ _ __ ___ (_)_ __  ");
    console.log("|  _ \\ / _ \\ '_ \\ | |/ _` | '_ ` _ \\| | '_ \\ ");
    console.log("| |_) |  __/ | | || | (_| | | | | | | | | | |");
    console.log("|____/ \\___|_| |_|/ |\\__,_|_| |_| |_|_|_| |_|");
    console.log("                |__/                         ");
    console.log("https://linktr.ee/devestivaledebrou");
    // Fin easter egg

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingProvider>
      {isLoading && <PageLoader />}
      {isAdminRoute ? (
        <AdminLayout
          currentUser={{
            id: 1,
            firstName: "Admin",
            lastName: "User",
            userType: "Administrateur",
          }}
        >
          {children}
        </AdminLayout>
      ) : (
        <DefaultLayout>{children}</DefaultLayout>
      )}
    </LoadingProvider>
  );
}
