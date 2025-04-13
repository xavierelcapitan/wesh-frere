import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  DocumentData,
  Timestamp
} from "firebase/firestore";

// Interface pour les données utilisateur
export interface UserData {
  id?: string;
  pseudo: string;
  prenom: string;
  age: number; // année uniquement
  ville: string;
  email: string;
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
  status?: 'active' | 'inactive' | 'banned' | 'visitor';
  role?: 'admin' | 'user' | 'editor';
  favoris?: string[]; // IDs des mots favoris
  lastLogin?: string | Timestamp;
  warnings?: number; // Nombre d'avertissements
  banReason?: string; // Raison du bannissement
}

// Collection Firestore
const USERS_COLLECTION = "users";

// Créer ou mettre à jour un utilisateur
export async function createOrUpdateUser(userData: UserData): Promise<string> {
  try {
    const userRef = userData.id 
      ? doc(db, USERS_COLLECTION, userData.id) 
      : doc(collection(db, USERS_COLLECTION));
    
    const id = userData.id || userRef.id;
    
    // Préparer les données avec timestamps
    const dataToSave = {
      ...userData,
      id,
      updatedAt: Timestamp.now(),
      createdAt: userData.createdAt || Timestamp.now(),
    };
    
    // Créer ou mettre à jour le document
    await setDoc(userRef, dataToSave);
    return id;
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour de l'utilisateur:", error);
    throw error;
  }
}

// Récupérer tous les utilisateurs
export async function getAllUsers(): Promise<UserData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as UserData));
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw error;
  }
}

// Récupérer un utilisateur par ID
export async function getUserById(userId: string): Promise<UserData | null> {
  try {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    throw error;
  }
}

// Récupérer un utilisateur par email
export async function getUserByEmail(email: string): Promise<UserData | null> {
  try {
    const q = query(collection(db, USERS_COLLECTION), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() } as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur par email:", error);
    throw error;
  }
}

// Supprimer un utilisateur
export async function deleteUser(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    throw error;
  }
}

// Mettre à jour le statut d'un utilisateur
export async function updateUserStatus(userId: string, status: 'active' | 'inactive' | 'banned' | 'visitor'): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, { 
      status, 
      updatedAt: Timestamp.now(),
      // Si on débloque un utilisateur banni, on réinitialise la raison du bannissement
      ...(status !== 'banned' ? { banReason: "" } : {})
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de l'utilisateur:", error);
    throw error;
  }
}

// Ajouter un mot aux favoris
export async function addToFavorites(userId: string, wordId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const favoris = userData.favoris || [];
      
      // Ajouter le mot aux favoris s'il n'y est pas déjà
      if (!favoris.includes(wordId)) {
        await updateDoc(userRef, { 
          favoris: [...favoris, wordId],
          updatedAt: Timestamp.now() 
        });
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout aux favoris:", error);
    throw error;
  }
}

// Retirer un mot des favoris
export async function removeFromFavorites(userId: string, wordId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const favoris = userData.favoris || [];
      
      // Retirer le mot des favoris
      const updatedFavoris = favoris.filter((id: string) => id !== wordId);
      
      await updateDoc(userRef, { 
        favoris: updatedFavoris,
        updatedAt: Timestamp.now() 
      });
    }
  } catch (error) {
    console.error("Erreur lors du retrait des favoris:", error);
    throw error;
  }
}

// Mettre à jour la dernière connexion
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, { 
      lastLogin: Timestamp.now(),
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la dernière connexion:", error);
    throw error;
  }
}

// Ajouter un avertissement à un utilisateur
export async function addWarningToUser(userId: string, reason?: string): Promise<number> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("Utilisateur non trouvé");
    }
    
    const userData = userDoc.data();
    const currentWarnings = userData.warnings || 0;
    const newWarnings = currentWarnings + 1;
    
    // Si l'utilisateur a 2 avertissements ou plus, on le bannit
    if (newWarnings >= 2) {
      await updateDoc(userRef, {
        warnings: newWarnings,
        status: 'banned',
        banReason: reason || "Multiple avertissements",
        updatedAt: Timestamp.now()
      });
    } else {
      await updateDoc(userRef, {
        warnings: newWarnings,
        updatedAt: Timestamp.now()
      });
    }
    
    return newWarnings;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un avertissement à l'utilisateur:", error);
    throw error;
  }
}

// Bannir un utilisateur
export async function banUser(userId: string, reason?: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      status: 'banned',
      banReason: reason || "Violation des règles de la communauté",
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Erreur lors du bannissement de l'utilisateur:", error);
    throw error;
  }
}

// Débannir un utilisateur
export async function unbanUser(userId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      status: 'active',
      banReason: "",
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Erreur lors de la levée du bannissement de l'utilisateur:", error);
    throw error;
  }
}

// Réinitialiser les avertissements d'un utilisateur
export async function resetUserWarnings(userId: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      warnings: 0,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation des avertissements de l'utilisateur:", error);
    throw error;
  }
}

// Vérifier si un utilisateur est banni (par email ou pseudo)
export async function checkUserBanned(email: string, pseudo: string): Promise<{ banned: boolean, reason?: string }> {
  try {
    // Vérifier par email
    const emailQuery = query(
      collection(db, USERS_COLLECTION), 
      where("email", "==", email),
      where("status", "==", "banned")
    );
    const emailResults = await getDocs(emailQuery);
    
    if (!emailResults.empty) {
      const userData = emailResults.docs[0].data();
      return { banned: true, reason: userData.banReason || "Compte banni" };
    }
    
    // Vérifier par pseudo
    const pseudoQuery = query(
      collection(db, USERS_COLLECTION), 
      where("pseudo", "==", pseudo),
      where("status", "==", "banned")
    );
    const pseudoResults = await getDocs(pseudoQuery);
    
    if (!pseudoResults.empty) {
      const userData = pseudoResults.docs[0].data();
      return { banned: true, reason: userData.banReason || "Compte banni" };
    }
    
    return { banned: false };
  } catch (error) {
    console.error("Erreur lors de la vérification du statut de bannissement:", error);
    throw error;
  }
} 