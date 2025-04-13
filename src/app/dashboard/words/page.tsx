"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  Trash, 
  Plus, 
  Search, 
  Eye, 
  MessageSquare,
  ThumbsUp,
  MoreVertical
} from "lucide-react";
import { 
  getAllWords, 
  createOrUpdateWord, 
  deleteWord, 
  updateWordStatus
} from "@/services/words";
import { WordData } from "@/services/words";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserById } from "@/services/users";
import { useAuth } from "@/lib/auth-context";

export default function WordsPage() {
  const [words, setWords] = useState<WordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    definition: "",
    exemple: "",
    origine: "",
    tags: "",
    status: "active" as "active" | "pending" | "rejected"
  });
  const [userNames, setUserNames] = useState<{[key: string]: string}>({});
  const { user } = useAuth();

  // Charger les mots au chargement de la page
  useEffect(() => {
    fetchWords();
  }, []);

  // Récupérer les mots
  const fetchWords = async () => {
    try {
      setLoading(true);
      const wordsData = await getAllWords();
      setWords(wordsData);
      
      // Récupérer les noms d'utilisateurs pour les mots qui ont un createdBy
      const userIds = wordsData
        .filter(word => word.createdBy)
        .map(word => word.createdBy as string);
      
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
      
      setUserNames(userNamesMap);
    } catch (error) {
      console.error("Erreur lors de la récupération des mots:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les mots par terme de recherche
  const filteredWords = words.filter(word => {
    // Vérifier que les propriétés text et definition existent avant d'appeler toLowerCase()
    const wordText = word.text || '';
    const wordDefinition = word.definition || '';
    
    return (
      wordText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wordDefinition.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Formater la date
  const formatDate = (dateValue: string | undefined | { toDate: () => Date }) => {
    if (!dateValue) return "-";
    
    let date;
    if (typeof dateValue === 'object' && dateValue !== null && 'toDate' in dateValue) {
      // C'est un objet Timestamp de Firestore
      date = dateValue.toDate();
    } else if (typeof dateValue === 'string') {
      // C'est une chaîne de date
      date = new Date(dateValue);
    } else {
      return "-";
    }
    
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  // Ouvrir la modale de détails
  const openViewModal = (word: WordData) => {
    setSelectedWord(word);
    setIsViewModalOpen(true);
  };

  // Ouvrir la modale d'édition
  const openEditModal = (word: WordData) => {
    setSelectedWord(word);
    setFormData({
      text: word.text,
      definition: word.definition,
      exemple: word.exemple || "",
      origine: word.origine || "",
      tags: word.tags?.join(", ") || "",
      status: word.status || "active"
    });
    setIsAddModalOpen(true);
  };

  // Ouvrir la modale de suppression
  const openDeleteModal = (word: WordData) => {
    setSelectedWord(word);
    setIsDeleteModalOpen(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      text: "",
      definition: "",
      exemple: "",
      origine: "",
      tags: "",
      status: "active"
    });
    setSelectedWord(null);
  };

  // Ouvrir la modale d'ajout
  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  // Gérer le changement dans les champs du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Gérer les changements de sélecteur (comme le statut)
  const handleSelectChange = (name: string, value: "active" | "pending" | "rejected") => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const wordData: WordData = {
        text: formData.text,
        definition: formData.definition,
        exemple: formData.exemple || undefined,
        origine: formData.origine || undefined,
        tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()) : undefined,
        status: formData.status || "active",
        createdBy: 'admin'
      };

      if (selectedWord?.id) {
        wordData.id = selectedWord.id;
      }

      await createOrUpdateWord(wordData);
      setIsAddModalOpen(false);
      fetchWords();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du mot:", error);
    }
  };

  // Supprimer un mot
  const handleDelete = async () => {
    if (!selectedWord?.id) return;
    
    try {
      await deleteWord(selectedWord.id);
      setIsDeleteModalOpen(false);
      fetchWords();
    } catch (error) {
      console.error("Erreur lors de la suppression du mot:", error);
    }
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return null;
    }
  };

  // Fonction pour afficher l'auteur
  const getAuthorName = (createdById: string | undefined) => {
    if (!createdById) return "-";
    // Si c'est un admin ou si le createdBy n'est pas dans la liste d'utilisateurs (probablement un admin)
    if (createdById === 'admin' || !userNames[createdById]) {
      return <Badge variant="outline" className="bg-purple-50 text-purple-700">Admin</Badge>;
    }
    return userNames[createdById];
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des mots</h1>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un mot
        </Button>
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
                <TableHead>Auteur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Commentaires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredWords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Aucun mot trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredWords.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell className="font-medium">{word.text || ''}</TableCell>
                    <TableCell className="truncate max-w-xs">
                      {word.definition ? (
                        word.definition.length > 50
                          ? `${word.definition.substring(0, 50)}...`
                          : word.definition
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {getAuthorName(word.createdBy)}
                    </TableCell>
                    <TableCell>{getStatusBadge(word.status)}</TableCell>
                    <TableCell>{formatDate(word.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <ThumbsUp className="mr-1 h-4 w-4 text-blue-500" />
                        {word.likesCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MessageSquare className="mr-1 h-4 w-4 text-green-500" />
                        {0} {/* À implémenter lorsque nous aurons la collection de commentaires */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewModal(word)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditModal(word)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteModal(word)}
                            className="text-red-600"
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modale d'ajout/modification */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedWord ? "Modifier le mot" : "Ajouter un nouveau mot"}</DialogTitle>
            <DialogDescription>
              {selectedWord 
                ? "Modifiez les informations du mot et cliquez sur Enregistrer." 
                : "Ajoutez un nouveau mot et sa définition."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="text" className="text-right">
                  Mot
                </Label>
                <Input
                  id="text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="definition" className="text-right">
                  Définition
                </Label>
                <Textarea
                  id="definition"
                  name="definition"
                  value={formData.definition}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exemple" className="text-right">
                  Exemple
                </Label>
                <Textarea
                  id="exemple"
                  name="exemple"
                  value={formData.exemple}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="origine" className="text-right">
                  Origine
                </Label>
                <Input
                  id="origine"
                  name="origine"
                  value={formData.origine}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Séparez les tags par des virgules"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Statut
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value as "active" | "pending" | "rejected")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="pending">En pause</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modale de détails */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedWord?.text}</DialogTitle>
            <DialogDescription>
              Détails du mot
            </DialogDescription>
          </DialogHeader>
          {selectedWord && (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Définition</p>
                <p className="text-sm text-gray-700">{selectedWord.definition || '-'}</p>
              </div>
              {selectedWord.exemple && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Exemple</p>
                  <p className="text-sm text-gray-700 italic">"{selectedWord.exemple}"</p>
                </div>
              )}
              {selectedWord.origine && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Origine</p>
                  <p className="text-sm text-gray-700">{selectedWord.origine}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium">Statut</p>
                <div>{getStatusBadge(selectedWord.status)}</div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Statistiques</p>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <ThumbsUp className="mr-1 h-4 w-4 text-blue-500" />
                    <p className="text-sm">{selectedWord.likesCount || 0} likes</p>
                  </div>
                  <div className="flex items-center">
                    <Eye className="mr-1 h-4 w-4 text-purple-500" />
                    <p className="text-sm">{selectedWord.viewsCount || 0} vues</p>
                  </div>
                </div>
              </div>
              {selectedWord.tags && selectedWord.tags.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedWord.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium">Date de création</p>
                <p className="text-sm text-gray-700">{formatDate(selectedWord.createdAt)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modale de suppression */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce mot ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le mot <span className="font-bold">{selectedWord?.text}</span> sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 