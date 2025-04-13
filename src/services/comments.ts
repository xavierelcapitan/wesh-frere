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
  QueryDocumentSnapshot,
  DocumentReference
} from "firebase/firestore";

// Interface pour les données de commentaire
export interface CommentData {
  id?: string;
  wordId: string;
  userId: string;
  text: string;
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
  status?: 'active' | 'hidden' | 'flagged';
}

// Collection Firestore
const COMMENTS_COLLECTION = "comments";

// Créer un nouveau commentaire
export async function createComment(commentData: CommentData): Promise<string> {
  try {
    const commentRef = doc(collection(db, COMMENTS_COLLECTION));
    
    // Préparer les données avec timestamps
    const dataToSave = {
      ...commentData,
      id: commentRef.id,
      status: commentData.status || 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    // Enregistrer le commentaire
    await setDoc(commentRef, dataToSave);
    return commentRef.id;
  } catch (error) {
    console.error("Erreur lors de la création du commentaire:", error);
    throw error;
  }
}

// Récupérer tous les commentaires
export async function getAllComments(): Promise<CommentData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COMMENTS_COLLECTION));
    return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as CommentData));
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires:", error);
    throw error;
  }
}

// Récupérer les commentaires d'un mot
export async function getWordComments(wordId: string): Promise<CommentData[]> {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("wordId", "==", wordId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as CommentData));
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires du mot:", error);
    throw error;
  }
}

// Récupérer les commentaires d'un utilisateur
export async function getUserComments(userId: string): Promise<CommentData[]> {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as CommentData));
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires de l'utilisateur:", error);
    throw error;
  }
}

// Récupérer un commentaire par ID
export async function getCommentById(commentId: string): Promise<CommentData | null> {
  try {
    const docSnap = await getDoc(doc(db, COMMENTS_COLLECTION, commentId));
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CommentData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du commentaire:", error);
    throw error;
  }
}

// Mettre à jour un commentaire
export async function updateComment(commentId: string, commentData: Partial<CommentData>): Promise<void> {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(commentRef, { 
      ...commentData,
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du commentaire:", error);
    throw error;
  }
}

// Mettre à jour le statut d'un commentaire
export async function updateCommentStatus(commentId: string, status: 'active' | 'hidden' | 'flagged'): Promise<void> {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(commentRef, { 
      status, 
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du commentaire:", error);
    throw error;
  }
}

// Supprimer un commentaire
export async function deleteComment(commentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire:", error);
    throw error;
  }
}

// Compter les commentaires par utilisateur
export async function countUserComments(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Erreur lors du comptage des commentaires de l'utilisateur:", error);
    throw error;
  }
} 