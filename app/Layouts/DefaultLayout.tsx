"use client";

import dynamic from "next/dynamic";
import React from "react";
import { usePathname } from "next/navigation";

const Navbar = dynamic(() => import("../../components/common/Navbar"), {
  loading: () => null,
});

const MobileNavbar = dynamic(
  () => import("../../components/common/MobileNavbar"),
  {
    loading: () => null,
  }
);

const Footer = dynamic(() => import("../../components/common/Footer"), {
  loading: () => null,
});

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith("/espace-choriste");
  return (
    <div className="min-h-screen flex flex-col">
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <div className="block lg:hidden">
        <MobileNavbar />
      </div>
      <main className="flex-grow lg:mt-20 dark:bg-dark-mode">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default ClientLayout;
