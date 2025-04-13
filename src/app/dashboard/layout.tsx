"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import DashboardLayout from "@/components/dashboard-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading, userRole, checkIsAdmin } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    // Rediriger vers login si non connecté
    if (!loading && !user) {
      router.push("/login");
    }
    
    // Vérifier si l'utilisateur est admin
    if (user && !loading) {
      setIsCheckingRole(true);
      checkIsAdmin()
        .then(result => {
          setIsAdmin(result);
          if (!result) {
            // Rediriger si l'utilisateur n'est pas admin
            router.push("/login");
          }
        })
        .catch(() => {
          // En cas d'erreur, rediriger par précaution
          router.push("/login");
        })
        .finally(() => {
          setIsCheckingRole(false);
        });
    }
  }, [user, loading, router, checkIsAdmin]);

  // Afficher un spinner pendant le chargement
  if (loading || isCheckingRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Masquer le contenu si l'utilisateur n'est pas admin
  if (!user || !isAdmin) {
    return null;
  }

  // Afficher le layout du dashboard si l'utilisateur est admin
  return <DashboardLayout>{children}</DashboardLayout>;
} 