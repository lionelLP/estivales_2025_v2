"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import DefaultLayout from "./DefaultLayout";
import AdminLayout from "./AdminLayout";
import PageLoader from "@/components/common/PageLoader";
import { LoadingProvider } from "@/contexts/LoadingContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
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
