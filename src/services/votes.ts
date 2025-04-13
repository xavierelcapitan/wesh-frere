import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { incrementLikeCount, decrementLikeCount } from "./words";

// Interface pour les votes
export interface VoteData {
  id?: string;
  userId: string;
  wordId: string;
  value: number; // 1 pour like, -1 pour dislike
  createdAt?: string | Timestamp;
}

// Collection Firestore
const VOTES_COLLECTION = "votes";

// Ajouter ou mettre à jour un vote
export async function addVote(voteData: VoteData): Promise<string> {
  try {
    // Vérifier si l'utilisateur a déjà voté pour ce mot
    const existingVote = await getUserVoteForWord(voteData.userId, voteData.wordId);
    
    // Si un vote existe déjà et a la même valeur, ne rien faire
    if (existingVote && existingVote.value === voteData.value) {
      return existingVote.id!;
    }
    
    // Si un vote existe avec une valeur différente, supprimer l'ancien vote et mettre à jour le compteur
    if (existingVote) {
      await deleteVote(existingVote.id!);
      if (existingVote.value === 1) {
        await decrementLikeCount(voteData.wordId);
      }
    }
    
    // Créer un nouveau vote
    const voteRef = existingVote?.id 
      ? doc(db, VOTES_COLLECTION, existingVote.id) 
      : doc(collection(db, VOTES_COLLECTION));
    
    const id = existingVote?.id || voteRef.id;
    
    // Préparer les données avec timestamp
    const dataToSave = {
      ...voteData,
      id,
      createdAt: Timestamp.now()
    };
    
    // Enregistrer le nouveau vote
    await setDoc(voteRef, dataToSave);
    
    // Mettre à jour le compteur de likes du mot
    if (voteData.value === 1) {
      await incrementLikeCount(voteData.wordId);
    }
    
    return id;
  } catch (error) {
    console.error("Erreur lors de l'ajout du vote:", error);
    throw error;
  }
}

// Supprimer un vote
export async function deleteVote(voteId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, VOTES_COLLECTION, voteId));
  } catch (error) {
    console.error("Erreur lors de la suppression du vote:", error);
    throw error;
  }
}

// Récupérer tous les votes d'un utilisateur
export async function getUserVotes(userId: string): Promise<VoteData[]> {
  try {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as VoteData));
  } catch (error) {
    console.error("Erreur lors de la récupération des votes de l'utilisateur:", error);
    throw error;
  }
}

// Récupérer tous les votes pour un mot
export async function getWordVotes(wordId: string): Promise<VoteData[]> {
  try {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where("wordId", "==", wordId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    } as VoteData));
  } catch (error) {
    console.error("Erreur lors de la récupération des votes pour le mot:", error);
    throw error;
  }
}

// Récupérer le vote d'un utilisateur pour un mot spécifique
export async function getUserVoteForWord(userId: string, wordId: string): Promise<VoteData | null> {
  try {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where("userId", "==", userId),
      where("wordId", "==", wordId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      return { id: docSnapshot.id, ...docSnapshot.data() } as VoteData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du vote de l'utilisateur pour le mot:", error);
    throw error;
  }
}

// Récupérer les statistiques de votes par jour (pour les graphiques)
export async function getVotesStatsByDate(days: number = 30): Promise<Array<{date: string, count: number}>> {
  try {
    // Calculer la date limite (30 jours en arrière par défaut)
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - days);
    
    const q = query(
      collection(db, VOTES_COLLECTION),
      where("createdAt", ">=", Timestamp.fromDate(limitDate)),
      orderBy("createdAt", "asc")
    );
    
    const querySnapshot = await getDocs(q);
    const votes = querySnapshot.docs.map((docSnapshot: QueryDocumentSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }));
    
    // Grouper les votes par jour
    const statsByDate = votes.reduce((acc: {[key: string]: {date: string, count: number}}, vote: any) => {
      const date = new Date(vote.createdAt.toDate());
      const dateString = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      if (!acc[dateString]) {
        acc[dateString] = { date: dateString, count: 0 };
      }
      
      acc[dateString].count++;
      return acc;
    }, {});
    
    // Convertir l'objet en tableau pour le graphique
    return Object.values(statsByDate);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques de votes:", error);
    throw error;
  }
} 