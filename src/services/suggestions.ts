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
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";

// Interface pour les suggestions
export interface SuggestionData {
  id?: string;
  userId: string;
  wordId?: string; // Si c'est une suggestion pour modifier un mot existant
  text: string;
  definition: string;
  exemple?: string;
  origine?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
  reviewedBy?: string; // ID de l'admin qui a traité la suggestion
  reviewNote?: string; // Commentaire de l'admin
}

// Collection Firestore
const SUGGESTIONS_COLLECTION = "suggestions";

// Créer une nouvelle suggestion
export async function createSuggestion(suggestionData: SuggestionData): Promise<string> {
  try {
    const suggestionRef = doc(collection(db, SUGGESTIONS_COLLECTION));
    
    // Préparer les données avec timestamps
    const dataToSave = {
      ...suggestionData,
      id: suggestionRef.id,
      status: suggestionData.status || 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Enregistrer la suggestion
    await setDoc(suggestionRef, dataToSave);
    return suggestionRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la suggestion:", error);
    throw error;
  }
}

// Récupérer toutes les suggestions
export async function getAllSuggestions(): Promise<SuggestionData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, SUGGESTIONS_COLLECTION));
    return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as SuggestionData));
  } catch (error) {
    console.error("Erreur lors de la récupération des suggestions:", error);
    throw error;
  }
}

// Récupérer les suggestions en attente
export async function getPendingSuggestions(): Promise<SuggestionData[]> {
  try {
    const q = query(
      collection(db, SUGGESTIONS_COLLECTION),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as SuggestionData));
  } catch (error) {
    console.error("Erreur lors de la récupération des suggestions en attente:", error);
    throw error;
  }
}

// Récupérer une suggestion par ID
export async function getSuggestionById(suggestionId: string): Promise<SuggestionData | null> {
  try {
    const docSnap = await getDoc(doc(db, SUGGESTIONS_COLLECTION, suggestionId));
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SuggestionData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de la suggestion:", error);
    throw error;
  }
}

// Récupérer les suggestions d'un utilisateur
export async function getUserSuggestions(userId: string): Promise<SuggestionData[]> {
  try {
    const q = query(
      collection(db, SUGGESTIONS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as SuggestionData));
  } catch (error) {
    console.error("Erreur lors de la récupération des suggestions de l'utilisateur:", error);
    throw error;
  }
}

// Approuver une suggestion
export async function approveSuggestion(
  suggestionId: string, 
  adminId: string, 
  note?: string
): Promise<void> {
  try {
    const suggestionRef = doc(db, SUGGESTIONS_COLLECTION, suggestionId);
    await updateDoc(suggestionRef, { 
      status: 'approved', 
      reviewedBy: adminId,
      reviewNote: note || '',
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Erreur lors de l'approbation de la suggestion:", error);
    throw error;
  }
}

// Rejeter une suggestion
export async function rejectSuggestion(
  suggestionId: string, 
  adminId: string, 
  note?: string
): Promise<void> {
  try {
    const suggestionRef = doc(db, SUGGESTIONS_COLLECTION, suggestionId);
    await updateDoc(suggestionRef, { 
      status: 'rejected', 
      reviewedBy: adminId,
      reviewNote: note || '',
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Erreur lors du rejet de la suggestion:", error);
    throw error;
  }
}

// Supprimer une suggestion
export async function deleteSuggestion(suggestionId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, SUGGESTIONS_COLLECTION, suggestionId));
  } catch (error) {
    console.error("Erreur lors de la suppression de la suggestion:", error);
    throw error;
  }
}

// Récupérer les statistiques de suggestions
export async function getSuggestionsStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
}> {
  try {
    const querySnapshot = await getDocs(collection(db, SUGGESTIONS_COLLECTION));
    const suggestions = querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => docSnapshot.data());
    
    // Calculer les statistiques
    const total = suggestions.length;
    const pending = suggestions.filter((s: DocumentData) => s.status === 'pending').length;
    const approved = suggestions.filter((s: DocumentData) => s.status === 'approved').length;
    const rejected = suggestions.filter((s: DocumentData) => s.status === 'rejected').length;
    
    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? (approved / total) * 100 : 0
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques de suggestions:", error);
    throw error;
  }
} 