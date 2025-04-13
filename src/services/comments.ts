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

// Interface pour les signalements de commentaires
export interface CommentReportData {
  id?: string;
  commentId: string;
  reporterId: string; // Utilisateur qui signale
  userId: string;     // Auteur du commentaire signalé
  reason?: string;    // Raison du signalement
  createdAt?: string | Timestamp;
  status?: 'pending' | 'reviewed' | 'dismissed';
}

// Collection Firestore
const COMMENTS_COLLECTION = "comments";
const COMMENT_REPORTS_COLLECTION = "comment-reports";

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

// Bloquer un commentaire (remplacer le texte par un message standard)
export async function blockComment(commentId: string): Promise<void> {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(commentRef, { 
      text: "Ce commentaire a été bloqué car il ne respecte pas la charte de l'application",
      status: 'hidden',
      updatedAt: Timestamp.now() 
    });
  } catch (error) {
    console.error("Erreur lors du blocage du commentaire:", error);
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

// Créer un signalement de commentaire
export async function reportComment(reportData: CommentReportData): Promise<string> {
  try {
    const reportRef = doc(collection(db, COMMENT_REPORTS_COLLECTION));
    
    // Préparer les données avec timestamps
    const dataToSave = {
      ...reportData,
      id: reportRef.id,
      status: reportData.status || 'pending',
      createdAt: Timestamp.now(),
    };
    
    // Enregistrer le signalement
    await setDoc(reportRef, dataToSave);
    
    // Marquer le commentaire comme signalé
    await updateCommentStatus(reportData.commentId, 'flagged');
    
    return reportRef.id;
  } catch (error) {
    console.error("Erreur lors du signalement du commentaire:", error);
    throw error;
  }
}

// Récupérer tous les signalements de commentaires
export async function getAllCommentReports(): Promise<CommentReportData[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COMMENT_REPORTS_COLLECTION));
    return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as CommentReportData));
  } catch (error) {
    console.error("Erreur lors de la récupération des signalements:", error);
    throw error;
  }
}

// Récupérer les signalements en attente
export async function getPendingCommentReports(): Promise<CommentReportData[]> {
  try {
    const q = query(
      collection(db, COMMENT_REPORTS_COLLECTION),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as CommentReportData));
  } catch (error) {
    console.error("Erreur lors de la récupération des signalements en attente:", error);
    throw error;
  }
}

// Récupérer un signalement par ID
export async function getCommentReportById(reportId: string): Promise<CommentReportData | null> {
  try {
    const docSnap = await getDoc(doc(db, COMMENT_REPORTS_COLLECTION, reportId));
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CommentReportData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du signalement:", error);
    throw error;
  }
}

// Mettre à jour le statut d'un signalement
export async function updateCommentReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'dismissed'): Promise<void> {
  try {
    const reportRef = doc(db, COMMENT_REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, { status });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du signalement:", error);
    throw error;
  }
}

// Supprimer un signalement
export async function deleteCommentReport(reportId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COMMENT_REPORTS_COLLECTION, reportId));
  } catch (error) {
    console.error("Erreur lors de la suppression du signalement:", error);
    throw error;
  }
} 