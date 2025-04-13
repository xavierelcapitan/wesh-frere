"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import Cookies from 'js-cookie';

type UserRole = 'admin' | 'user' | null;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  userRole: UserRole;
  checkIsAdmin: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
  checkIsAdmin: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Stocker le token d'authentification dans un cookie pour le middleware
        try {
          const token = await user.getIdToken();
          Cookies.set('session', token, { expires: 7, secure: true });
          
          // Vérifier le rôle de l'utilisateur dans Firestore
          checkUserRole(user.uid);
        } catch (error) {
          console.error("Erreur lors de la récupération du token:", error);
        }
      } else {
        // Supprimer le cookie si l'utilisateur est déconnecté
        Cookies.remove('session');
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fonction pour vérifier le rôle de l'utilisateur dans Firestore
  const checkUserRole = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role as UserRole);
      } else {
        setUserRole(null);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle:", error);
      setUserRole(null);
    }
  };

  // Fonction pour vérifier si l'utilisateur est admin
  const checkIsAdmin = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role === 'admin';
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la vérification du rôle admin:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, userRole, checkIsAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 