"use client";

import dynamic from "next/dynamic";
import React from "react";

const Navbar = dynamic(() => import("../../components/common/Navbar"), {
  loading: () => null,
});

const MobileNavbar = dynamic(
  () => import("../../components/common/MobileNavbar"),
  {
    loading: () => null,
  }
);

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  return (
    <div>
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <div className="block lg:hidden">
        <MobileNavbar />
      </div>
      <main className="flex-grow lg:mt-20">{children}</main>
    </div>
  );
};

export default ClientLayout;
