"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createOrUpdateWord, WordData } from "@/services/words";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
  SuggestionData, 
  getAllSuggestions, 
  approveSuggestion, 
  rejectSuggestion,
  getSuggestionById
} from "@/services/suggestions";
import { useAuth } from "@/lib/auth-context";
import { getUserById } from "@/services/users";

// Interface adaptée pour les besoins de l'UI
interface UISuggestion extends SuggestionData {
  userName?: string;
  viewed?: boolean;
}

export default function SuggestionsPage() {
  const [suggestions, setSuggestions] = useState<UISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<UISuggestion | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const { user } = useAuth();

  // Charger les suggestions depuis Firestore
  useEffect(() => {
    fetchSuggestions();
  }, []);

  // Récupérer les suggestions
  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      
      // Récupérer les suggestions depuis Firestore
      const suggestionsData = await getAllSuggestions();
      
      // Récupérer les noms d'utilisateurs
      const userIds = suggestionsData
        .filter(suggestion => suggestion.userId)
        .map(suggestion => suggestion.userId);
      
      // Dédupliquer les IDs
      const uniqueUserIds = [...new Set(userIds)];
      
      // Récupérer les données utilisateur
      const userNamesMap: {[key: string]: string} = {};
      
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          try {
            const user = await getUserById(userId);
            if (user) {
              userNamesMap[userId] = user.pseudo || user.email;
            }
          } catch (error) {
            console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, error);
          }
        })
      );
      
      // Ajouter les noms d'utilisateur et initialiser viewed
      const enhancedSuggestions: UISuggestion[] = suggestionsData.map(suggestion => ({
        ...suggestion,
        userName: userNamesMap[suggestion.userId] || "Utilisateur inconnu",
        viewed: suggestion.status !== 'pending' // Si le statut n'est pas 'pending', considéré comme vu
      }));
      
      setSuggestions(enhancedSuggestions);
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les suggestions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les suggestions par terme de recherche
  const filteredSuggestions = suggestions.filter(suggestion => {
    return (
      suggestion.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Formater la date
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "-";
    
    let date;
    if (typeof dateValue === 'object' && dateValue !== null && 'toDate' in dateValue) {
      // C'est un objet Timestamp de Firestore
      date = dateValue.toDate();
    } else if (typeof dateValue === 'string') {
      // C'est une chaîne de date
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return "-";
    }
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string, viewed: boolean | undefined) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Validé</Badge>;
      case "pending":
        return viewed 
          ? <Badge className="bg-blue-100 text-blue-800">En cours d'évaluation</Badge>
          : <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Refusé</Badge>;
      default:
        return null;
    }
  };

  // Ouvrir la modale de détails
  const openViewModal = async (suggestion: UISuggestion) => {
    // Marquer comme vu si c'était en attente
    if (!suggestion.viewed && suggestion.status === 'pending') {
      const updatedSuggestions = suggestions.map(s => 
        s.id === suggestion.id ? { ...s, viewed: true } : s
      );
      setSuggestions(updatedSuggestions);
    }
    
    // Charger les données à jour depuis Firestore pour s'assurer d'avoir les dernières informations
    try {
      if (suggestion.id) {
        const updatedSuggestion = await getSuggestionById(suggestion.id);
        if (updatedSuggestion) {
          const enhancedSuggestion: UISuggestion = {
            ...updatedSuggestion,
            userName: suggestion.userName,
            viewed: true
          };
          setSelectedSuggestion(enhancedSuggestion);
        } else {
          setSelectedSuggestion(suggestion);
        }
      } else {
        setSelectedSuggestion(suggestion);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de la suggestion:", error);
      setSelectedSuggestion(suggestion);
    }
    
    setIsViewModalOpen(true);
  };

  // Ouvrir la modale de refus
  const openRejectModal = () => {
    setRejectComment("");
    setIsRejectModalOpen(true);
  };

  // Approuver une suggestion
  const handleApprove = async () => {
    if (!selectedSuggestion || !selectedSuggestion.id || !user) return;
    
    try {
      // 1. Créer un nouveau mot dans la collection des mots avec le statut "pending"
      const wordData: WordData = {
        text: selectedSuggestion.text,
        definition: selectedSuggestion.definition,
        exemple: selectedSuggestion.exemple,
        origine: selectedSuggestion.origine,
        status: 'pending', // En pause
        createdBy: selectedSuggestion.userId, // Conserver l'ID de l'utilisateur
      };
      
      // 2. Ajouter le mot à la collection des mots
      await createOrUpdateWord(wordData);
      
      // 3. Mettre à jour le statut de la suggestion dans Firestore
      await approveSuggestion(
        selectedSuggestion.id,
        user.uid,
        "Suggestion approuvée et ajoutée à la collection des mots"
      );
      
      // 4. Mettre à jour l'état local
      const updatedSuggestions = suggestions.map(suggestion => 
        suggestion.id === selectedSuggestion.id 
          ? { 
              ...suggestion, 
              status: 'approved' as const, 
              viewed: true,
              reviewedBy: user.uid,
              reviewNote: "Suggestion approuvée et ajoutée à la collection des mots"
            } 
          : suggestion
      );
      
      setSuggestions(updatedSuggestions);
      setIsViewModalOpen(false);
      
      // 5. Afficher une notification de succès
      toast({
        title: "Suggestion validée",
        description: `Le mot "${selectedSuggestion.text}" a été ajouté à la collection des mots avec le statut "En pause".`,
      });
    } catch (error) {
      console.error("Erreur lors de la validation de la suggestion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la validation de la suggestion.",
        variant: "destructive",
      });
    }
  };

  // Rejeter une suggestion
  const handleReject = async () => {
    if (!selectedSuggestion || !selectedSuggestion.id || !user) return;
    
    try {
      // 1. Mettre à jour le statut de la suggestion dans Firestore
      await rejectSuggestion(
        selectedSuggestion.id,
        user.uid,
        rejectComment || undefined
      );
      
      // 2. Mettre à jour l'état local
      const updatedSuggestions = suggestions.map(suggestion => 
        suggestion.id === selectedSuggestion.id 
          ? { 
              ...suggestion, 
              status: 'rejected' as const, 
              viewed: true,
              reviewedBy: user.uid,
              reviewNote: rejectComment || undefined
            } 
          : suggestion
      );
      
      setSuggestions(updatedSuggestions);
      setIsRejectModalOpen(false);
      setIsViewModalOpen(false);
      
      // 3. Afficher une notification
      toast({
        title: "Suggestion refusée",
        description: "La suggestion a été refusée avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors du rejet de la suggestion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rejet de la suggestion.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suggestions de mots</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Rechercher un mot..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mot</TableHead>
                <TableHead>Définition</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Date de soumission</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredSuggestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Aucune suggestion trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuggestions.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell className="font-medium">{suggestion.text}</TableCell>
                    <TableCell className="truncate max-w-xs">
                      {suggestion.definition.length > 50
                        ? `${suggestion.definition.substring(0, 50)}...`
                        : suggestion.definition}
                    </TableCell>
                    <TableCell>{suggestion.userName || "Utilisateur inconnu"}</TableCell>
                    <TableCell>{formatDate(suggestion.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(suggestion.status, suggestion.viewed)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => openViewModal(suggestion)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modale de détails */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Détails de la suggestion</DialogTitle>
            <DialogDescription>
              Suggestion proposée par {selectedSuggestion?.userName || "un utilisateur inconnu"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Mot:</Label>
              <div className="col-span-3">
                {selectedSuggestion?.text}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right font-medium">Définition:</Label>
              <div className="col-span-3">
                {selectedSuggestion?.definition}
              </div>
            </div>
            
            {selectedSuggestion?.exemple && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right font-medium">Exemple:</Label>
                <div className="col-span-3">
                  {selectedSuggestion.exemple}
                </div>
              </div>
            )}
            
            {selectedSuggestion?.origine && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right font-medium">Origine:</Label>
                <div className="col-span-3">
                  {selectedSuggestion.origine}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Statut:</Label>
              <div className="col-span-3">
                {selectedSuggestion && getStatusBadge(selectedSuggestion.status, selectedSuggestion.viewed)}
              </div>
            </div>
            
            {/* Afficher le commentaire de refus si la suggestion est rejetée */}
            {selectedSuggestion?.status === 'rejected' && selectedSuggestion?.reviewNote && (
              <div className="grid grid-cols-4 items-start gap-4 mt-2">
                <Label className="text-right font-medium text-red-600">Raison du refus:</Label>
                <div className="col-span-3 p-2 bg-red-50 text-red-800 rounded border border-red-200">
                  {selectedSuggestion.reviewNote}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setIsViewModalOpen(false)}
            >
              Fermer
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={openRejectModal}
              disabled={selectedSuggestion?.status === 'rejected'}
            >
              <X className="h-4 w-4 mr-2" />
              Refuser
            </Button>
            <Button 
              type="button"
              variant="default"
              onClick={handleApprove}
              disabled={selectedSuggestion?.status === 'approved'}
            >
              <Check className="h-4 w-4 mr-2" />
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modale de refus avec commentaire */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Refuser la suggestion</DialogTitle>
            <DialogDescription>
              Veuillez expliquer la raison du refus (optionnel). Ce commentaire sera visible par l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Raison du refus..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setIsRejectModalOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleReject}
            >
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Notification */}
      <Toaster />
    </div>
  );
} 