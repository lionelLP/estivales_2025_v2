"use client";

import AdminLayout from "@/app/Layouts/AdminLayout";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "User",
    userType: "Administrateur",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AdminLayout currentUser={currentUser}>
        <div>
          <h1 className="text-3xl font-bold mb-12">
            Tableau de bord administrateur
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
              <p className="text-gray-600">Contenu à venir...</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Activités récentes</h2>
              <p className="text-gray-600">Contenu à venir...</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              <p className="text-gray-600">Contenu à venir...</p>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}
