"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Eye, 
  Search, 
  MessageCircle
} from "lucide-react";
import { 
  getAllComments, 
  CommentData 
} from "@/services/comments";
import { getUserById, UserData } from "@/services/users";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Interface pour les commentaires enrichies avec les données utilisateur
interface EnhancedComment extends CommentData {
  userName?: string;
  userEmail?: string;
  formattedDate?: string;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<EnhancedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedComment, setSelectedComment] = useState<EnhancedComment | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Formater la date
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return "Date inconnue";
    
    let date: Date;
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      // C'est un objet Timestamp de Firestore
      date = timestamp.toDate();
    } else if (typeof timestamp === 'string') {
      // C'est une chaîne de date
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return "Date invalide";
    }
    
    return format(date, "dd MMMM yyyy 'à' HH:mm", { locale: fr });
  };

  // Récupérer tous les commentaires
  const fetchComments = async () => {
    try {
      setLoading(true);
      const commentsData = await getAllComments();
      
      // Enrichir les commentaires avec les données utilisateur
      const enhancedComments = await Promise.all(
        commentsData.map(async (comment) => {
          try {
            // Récupérer les détails de l'utilisateur
            const user = await getUserById(comment.userId);
            
            return {
              ...comment,
              userName: user?.pseudo || "Utilisateur inconnu",
              userEmail: user?.email || "Email inconnu",
              formattedDate: formatDate(comment.createdAt)
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération des données pour le commentaire ${comment.id}:`, error);
            return {
              ...comment,
              userName: "Utilisateur inconnu",
              userEmail: "Email inconnu",
              formattedDate: formatDate(comment.createdAt)
            };
          }
        })
      );
      
      // Trier les commentaires par date (du plus récent au plus ancien)
      const sortedComments = enhancedComments.sort((a, b) => {
        const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
      
      setComments(sortedComments);
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les commentaires au chargement de la page
  useEffect(() => {
    fetchComments();
  }, []);

  // Filtrer les commentaires selon la recherche
  const filteredComments = comments.filter(comment => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (comment.userName && comment.userName.toLowerCase().includes(searchLower)) ||
      (comment.text && comment.text.toLowerCase().includes(searchLower))
    );
  });

  // Ouvrir la modale de détails du commentaire
  const openViewModal = (comment: EnhancedComment) => {
    setSelectedComment(comment);
    setIsViewModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des commentaires</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Rechercher par utilisateur ou texte..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commentaires</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <p>Chargement des commentaires...</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? "Aucun résultat trouvé pour cette recherche" 
                : "Aucun commentaire disponible"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pseudo</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="font-medium">
                      {comment.userName}
                    </TableCell>
                    <TableCell>
                      {comment.formattedDate}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => openViewModal(comment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modale de détails du commentaire */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails du commentaire</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Utilisateur:</Label>
              <div className="col-span-3">
                {selectedComment?.userName}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Email:</Label>
              <div className="col-span-3">
                {selectedComment?.userEmail}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Date:</Label>
              <div className="col-span-3">
                {selectedComment?.formattedDate}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right font-medium mt-2">Texte:</Label>
              <div className="col-span-3 bg-gray-50 p-3 rounded-md">
                {selectedComment?.text}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Status:</Label>
              <div className="col-span-3">
                {selectedComment?.status === 'flagged' && (
                  <span className="text-yellow-600 font-medium">Signalé</span>
                )}
                {selectedComment?.status === 'hidden' && (
                  <span className="text-red-600 font-medium">Masqué</span>
                )}
                {selectedComment?.status === 'active' && (
                  <span className="text-green-600 font-medium">Actif</span>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button"
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
} 