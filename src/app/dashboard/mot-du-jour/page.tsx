"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ThumbsUp, ThumbsDown, RotateCw } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";

interface Word {
  id: string;
  text: string;
  definition: string;
  exemple?: string;
  origine?: string;
  status: string;
  likesCount: number;
  viewsCount: number;
}

export default function MotDuJourPage() {
  const [wordOfTheDay, setWordOfTheDay] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const { toast } = useToast();

  // Charger le mot du jour
  useEffect(() => {
    fetchWordOfTheDay();
  }, []);

  // Fonction pour récupérer le mot du jour
  const fetchWordOfTheDay = async () => {
    setLoading(true);
    
    // On récupère un mot aléatoire parmi les mots actifs
    const wordsRef = collection(db, "words");
    const q = query(wordsRef, where("status", "==", "active"));
    
    try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        toast({
          title: "Aucun mot disponible",
          description: "Il n'y a pas de mots actifs dans la base de données.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Sélectionner un mot aléatoire
      const words = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Word));
      
      const randomIndex = Math.floor(Math.random() * words.length);
      const selectedWord = words[randomIndex];
      
      // Incrémenter le compteur de vues
      const wordRef = doc(db, "words", selectedWord.id);
      await updateDoc(wordRef, {
        viewsCount: (selectedWord.viewsCount || 0) + 1,
        updatedAt: Timestamp.now()
      });
      
      setWordOfTheDay(selectedWord);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération du mot du jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer le mot du jour.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // Rafraîchir le mot du jour
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchWordOfTheDay();
      toast({
        title: "Mise à jour réussie",
        description: "Le mot du jour a été actualisé."
      });
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de rafraîchir le mot du jour.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Voter pour un mot (like/dislike)
  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (!wordOfTheDay) return;
    
    setVoteLoading(true);
    try {
      const wordRef = doc(db, "words", wordOfTheDay.id);
      
      // Si c'est un like, on incrémente likesCount, sinon on le décrémente
      const increment = voteType === 'like' ? 1 : -1;
      
      await updateDoc(wordRef, {
        likesCount: (wordOfTheDay.likesCount || 0) + increment,
        updatedAt: Timestamp.now()
      });
      
      // Mettre à jour l'état local
      setWordOfTheDay({
        ...wordOfTheDay,
        likesCount: (wordOfTheDay.likesCount || 0) + increment
      });
      
      toast({
        title: voteType === 'like' ? "J'aime" : "Je n'aime pas",
        description: `Votre vote a été pris en compte.`
      });
    } catch (error) {
      console.error("Erreur lors du vote:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre vote.",
        variant: "destructive"
      });
    } finally {
      setVoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="ml-2">Chargement du mot du jour...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Mot du Jour</h1>
      
      {wordOfTheDay ? (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-2xl font-bold">
              {wordOfTheDay.text}
            </CardTitle>
            <div className="flex items-center space-x-1 text-gray-500 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(), "d MMMM yyyy", { locale: fr })}</span>
            </div>
          </CardHeader>
          
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Définition</h3>
                <p className="whitespace-pre-line">{wordOfTheDay.definition}</p>
              </div>
              
              {wordOfTheDay.exemple && (
                <div>
                  <h3 className="font-semibold text-lg mb-1">Exemple</h3>
                  <p className="italic text-gray-700">"{wordOfTheDay.exemple}"</p>
                </div>
              )}
              
              {wordOfTheDay.origine && (
                <div>
                  <h3 className="font-semibold text-lg mb-1">Origine</h3>
                  <p>{wordOfTheDay.origine}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-500">
                  <span>{wordOfTheDay.viewsCount || 0} vues</span>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleVote('like')}
                disabled={voteLoading}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                <span>{wordOfTheDay.likesCount || 0}</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleVote('dislike')}
                disabled={voteLoading}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                <span>Dislike</span>
              </Button>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Rafraîchissement...</span>
                </div>
              ) : (
                <>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Nouveau mot
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg mb-4">Aucun mot du jour disponible pour le moment.</p>
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? "Chargement..." : "Essayer à nouveau"}
          </Button>
        </div>
      )}
    </div>
  );
} 