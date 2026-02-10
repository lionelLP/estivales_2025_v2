"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  userType: number;
} | null;

export default function EspaceChoriste() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        const data = await response.json();
        if (response.ok) {
          setCurrentUser(data);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    if (currentUser.userType !== 1) {
      router.replace("/unauthorized");
    }
  }, [isLoading, currentUser, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-brou"></div>
      </div>
    );
  }

  if (!currentUser || currentUser.userType !== 1) {
    return null;
  }

  return (
    <div>
    </div>
  );
}
