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
  Timestamp,
  increment
} from "firebase/firestore";

// Interface pour les données d'un mot
export interface WordData {
  id?: string;
  text: string;
  definition: string;
  exemple?: string;
  origine?: string;
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
  status?: 'active' | 'pending' | 'rejected';
  createdBy?: string; // ID de l'utilisateur qui a créé le mot
  likesCount?: number;
  viewsCount?: number;
  tags?: string[];
}

// Collection Firestore
const WORDS_COLLECTION = "words";

// Créer ou mettre à jour un mot
export async function createOrUpdateWord(wordData: WordData): Promise<string> {
  try {
    const wordRef = wordData.id 
      ? doc(db, WORDS_COLLECTION, wordData.id) 
      : doc(collection(db, WORDS_COLLECTION));
    
    const id = wordData.id || wordRef.id;
    
    // Préparer les données avec timestamps
    const dataToSave = {
      ...wordData,
      id,
      updatedAt: Timestamp.now(),
      createdAt: wordData.createdAt || Timestamp.now(),
      likesCount: wordData.likesCount || 0,
      viewsCount: wordData.viewsCount || 0,
      // S'assurer que tags est un tableau vide et non undefined
      tags: wordData.tags || []
    };
    
    // Créer ou mettre à jour le document
    await setDoc(wordRef, dataToSave);
    return id;
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour du mot:", error);
    throw error;
  }
}

// Récupérer tous les mots
export async function getAllWords(): Promise<WordData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, WORDS_COLLECTION));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as WordData));
  } catch (error) {
    console.error("Erreur lors de la récupération des mots:", error);
    throw error;
  }
}

// Récupérer les mots actifs
export async function getActiveWords(): Promise<WordData[]> {
  try {
    const q = query(
      collection(db, WORDS_COLLECTION), 
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as WordData));
  } catch (error) {
    console.error("Erreur lors de la récupération des mots actifs:", error);
    throw error;
  }
}

// Récupérer un mot par ID
export async function getWordById(wordId: string): Promise<WordData | null> {
  try {
    const docSnap = await getDoc(doc(db, WORDS_COLLECTION, wordId));
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as WordData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du mot:", error);
    throw error;
  }
}

// Supprimer un mot
export async function deleteWord(wordId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, WORDS_COLLECTION, wordId));
  } catch (error) {
    console.error("Erreur lors de la suppression du mot:", error);
    throw error;
  }
}

// Mettre à jour le statut d'un mot
export async function updateWordStatus(wordId: string, status: 'active' | 'pending' | 'rejected'): Promise<void> {
  try {
    // D'abord récupérer le document actuel pour préserver les champs existants
    const wordRef = doc(db, WORDS_COLLECTION, wordId);
    const wordSnap = await getDoc(wordRef);
    
    if (!wordSnap.exists()) {
      throw new Error(`Le mot avec l'ID ${wordId} n'existe pas`);
    }
    
    // Mettre à jour uniquement le statut et le timestamp, en préservant les autres champs
    await updateDoc(wordRef, { 
      status, 
      updatedAt: Timestamp.now(),
      // S'assurer que le champ tags existe et est un tableau vide s'il est undefined
      ...(wordSnap.data().tags === undefined && { tags: [] })
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du mot:", error);
    throw error;
  }
}

// Incrémenter le compteur de vues
export async function incrementViewCount(wordId: string): Promise<void> {
  try {
    const wordRef = doc(db, WORDS_COLLECTION, wordId);
    await updateDoc(wordRef, { 
      viewsCount: increment(1),
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Erreur lors de l'incrémentation du compteur de vues:", error);
    throw error;
  }
}

// Incrémenter le compteur de likes
export async function incrementLikeCount(wordId: string): Promise<void> {
  try {
    const wordRef = doc(db, WORDS_COLLECTION, wordId);
    await updateDoc(wordRef, { 
      likesCount: increment(1),
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Erreur lors de l'incrémentation du compteur de likes:", error);
    throw error;
  }
}

// Décrémenter le compteur de likes
export async function decrementLikeCount(wordId: string): Promise<void> {
  try {
    const wordRef = doc(db, WORDS_COLLECTION, wordId);
    await updateDoc(wordRef, { 
      likesCount: increment(-1),
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Erreur lors de la décrémentation du compteur de likes:", error);
    throw error;
  }
}

// Rechercher des mots par texte
export async function searchWords(searchTerm: string): Promise<WordData[]> {
  try {
    // Note: Firestore n'a pas de recherche en texte intégral native
    // Cette implémentation recherche les mots qui commencent par le terme de recherche
    // Pour une recherche plus avancée, il faudrait utiliser Algolia ou un service similaire
    const q = query(
      collection(db, WORDS_COLLECTION),
      where("text", ">=", searchTerm),
      where("text", "<=", searchTerm + '\uf8ff'),
      where("status", "==", "active"),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as WordData));
  } catch (error) {
    console.error("Erreur lors de la recherche de mots:", error);
    throw error;
  }
}

// Récupérer les mots tendance (les plus likés)
export async function getTrendingWords(limit_count: number = 10): Promise<WordData[]> {
  try {
    const q = query(
      collection(db, WORDS_COLLECTION),
      where("status", "==", "active"),
      orderBy("likesCount", "desc"),
      limit(limit_count)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as WordData));
  } catch (error) {
    console.error("Erreur lors de la récupération des mots tendance:", error);
    throw error;
  }
} 