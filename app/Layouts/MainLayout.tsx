"use client";

import { usePathname } from "next/navigation";
import DefaultLayout from "./DefaultLayout";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return children;
  }

  return <DefaultLayout>{children}</DefaultLayout>;
}
