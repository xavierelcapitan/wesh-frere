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
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Eye, 
  Edit, 
  Search, 
  ThumbsUp, 
  MessageCircle, 
  Lightbulb,
  Plus
} from "lucide-react";
import { 
  createOrUpdateUser, 
  getAllUsers, 
  getUserById, 
  updateUserStatus, 
  UserData 
} from "@/services/users";
import { getUserVotes } from "@/services/votes";
import { getUserSuggestions } from "@/services/suggestions";
import { getUserComments, countUserComments } from "@/services/comments";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Interface pour les données utilisateurs enrichies (avec stats)
interface EnhancedUserData extends UserData {
  commentsCount?: number;
  suggestionsCount?: number;
  likesCount?: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<EnhancedUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EnhancedUserData | null>(null);
  const [formData, setFormData] = useState({
    prenom: "",
    pseudo: "",
    ville: "",
    email: "",
    age: 0,
    status: "active" as "active" | "inactive"
  });

  // Charger les utilisateurs au chargement de la page
  useEffect(() => {
    fetchUsers();
  }, []);

  // Récupérer les utilisateurs et leurs statistiques
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Récupérer les utilisateurs depuis Firestore
      const usersData = await getAllUsers();
      
      // Enrichir les données avec les statistiques
      const enhancedUsers = await Promise.all(
        usersData.map(async (user) => {
          if (!user.id) return user as EnhancedUserData;
          
          try {
            // Compter les commentaires
            const commentsCount = await countUserComments(user.id);
            
            // Compter les suggestions
            const suggestions = await getUserSuggestions(user.id);
            const suggestionsCount = suggestions.length;
            
            // Compter les likes (votes positifs uniquement)
            const votes = await getUserVotes(user.id);
            const likesCount = votes.filter(vote => vote.value === 1).length;
            
            return {
              ...user,
              commentsCount,
              suggestionsCount,
              likesCount
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération des stats pour l'utilisateur ${user.id}:`, error);
            return {
              ...user,
              commentsCount: 0,
              suggestionsCount: 0,
              likesCount: 0
            };
          }
        })
      );
      
      setUsers(enhancedUsers);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs par terme de recherche
  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (user.pseudo && user.pseudo.toLowerCase().includes(searchTermLower)) ||
      (user.prenom && user.prenom.toLowerCase().includes(searchTermLower)) ||
      (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
      (user.ville && user.ville.toLowerCase().includes(searchTermLower))
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
  const getStatusBadge = (status?: string) => {
    if (status === "active") {
      return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Bloqué</Badge>;
  };

  // Ouvrir la modale de détails
  const openViewModal = async (user: EnhancedUserData) => {
    // Charger les données fraîches pour cet utilisateur
    try {
      if (user.id) {
        const updatedUser = await getUserById(user.id);
        if (updatedUser) {
          setSelectedUser({
            ...updatedUser,
            commentsCount: user.commentsCount,
            suggestionsCount: user.suggestionsCount,
            likesCount: user.likesCount
          });
        } else {
          setSelectedUser(user);
        }
      } else {
        setSelectedUser(user);
      }
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'utilisateur:", error);
      setSelectedUser(user);
      setIsViewModalOpen(true);
    }
  };

  // Ouvrir la modale d'édition
  const openEditModal = (user: EnhancedUserData) => {
    setSelectedUser(user);
    setFormData({
      prenom: user.prenom || "",
      pseudo: user.pseudo || "",
      ville: user.ville || "",
      email: user.email || "",
      age: user.age || 0,
      status: user.status || "active"
    });
    setIsEditModalOpen(true);
  };

  // Ouvrir la modale d'ajout
  const openAddModal = () => {
    setFormData({
      prenom: "",
      pseudo: "",
      ville: "",
      email: "",
      age: 0,
      status: "active"
    });
    setIsAddModalOpen(true);
  };

  // Gérer le changement dans les champs du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    });
  };

  // Gérer les changements de sélecteur (comme le statut)
  const handleSelectChange = (name: string, value: "active" | "inactive") => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Soumettre le formulaire d'ajout/modification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userData: UserData = {
        prenom: formData.prenom,
        pseudo: formData.pseudo,
        ville: formData.ville,
        email: formData.email,
        age: formData.age,
        status: formData.status
      };

      if (selectedUser?.id) {
        userData.id = selectedUser.id;
      }

      await createOrUpdateUser(userData);
      
      toast({
        title: selectedUser ? "Utilisateur modifié" : "Utilisateur ajouté",
        description: `L'utilisateur ${formData.pseudo} a été ${selectedUser ? "modifié" : "ajouté"} avec succès.`,
      });
      
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchUsers(); // Rafraîchir la liste
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'utilisateur:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  // Mettre à jour le statut d'un utilisateur
  const handleStatusChange = async (userId: string, status: 'active' | 'inactive') => {
    if (!userId) return;
    
    try {
      await updateUserStatus(userId, status);
      
      // Mettre à jour l'état local
      setUsers(
        users.map(user => 
          user.id === userId ? { ...user, status } : user
        )
      );
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status });
      }
      
      toast({
        title: "Statut mis à jour",
        description: `L'utilisateur est maintenant ${status === 'active' ? 'actif' : 'bloqué'}.`,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du statut.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un utilisateur
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Rechercher un utilisateur..."
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
                <TableHead>Pseudo</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Commentaires</TableHead>
                <TableHead>Suggestions</TableHead>
                <TableHead>Likes</TableHead>
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
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.pseudo}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MessageCircle className="mr-1 h-4 w-4 text-blue-500" />
                        {user.commentsCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Lightbulb className="mr-1 h-4 w-4 text-yellow-500" />
                        {user.suggestionsCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <ThumbsUp className="mr-1 h-4 w-4 text-green-500" />
                        {user.likesCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openViewModal(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => openEditModal(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Prénom:</Label>
              <div className="col-span-3">
                {selectedUser?.prenom}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Pseudo:</Label>
              <div className="col-span-3">
                {selectedUser?.pseudo}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Email:</Label>
              <div className="col-span-3">
                {selectedUser?.email}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Ville:</Label>
              <div className="col-span-3">
                {selectedUser?.ville}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Date de création:</Label>
              <div className="col-span-3">
                {formatDate(selectedUser?.createdAt)}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Statut:</Label>
              <div className="col-span-3">
                {selectedUser && getStatusBadge(selectedUser.status)}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right font-medium">Statistiques:</Label>
              <div className="col-span-3 flex space-x-4">
                <div className="flex items-center">
                  <MessageCircle className="mr-1 h-4 w-4 text-blue-500" />
                  <span className="text-sm">{selectedUser?.commentsCount || 0} commentaires</span>
                </div>
                <div className="flex items-center">
                  <Lightbulb className="mr-1 h-4 w-4 text-yellow-500" />
                  <span className="text-sm">{selectedUser?.suggestionsCount || 0} suggestions</span>
                </div>
                <div className="flex items-center">
                  <ThumbsUp className="mr-1 h-4 w-4 text-green-500" />
                  <span className="text-sm">{selectedUser?.likesCount || 0} likes</span>
                </div>
              </div>
            </div>
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
              onClick={() => {
                setIsViewModalOpen(false);
                if (selectedUser) {
                  openEditModal(selectedUser);
                }
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modale d'ajout/modification */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (isAddModalOpen) setIsAddModalOpen(open);
        if (isEditModalOpen) setIsEditModalOpen(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</DialogTitle>
            <DialogDescription>
              {isEditModalOpen 
                ? "Modifiez les informations de l'utilisateur et cliquez sur Enregistrer."
                : "Remplissez les informations pour créer un nouvel utilisateur."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prenom" className="text-right">
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pseudo" className="text-right">
                  Pseudo
                </Label>
                <Input
                  id="pseudo"
                  name="pseudo"
                  value={formData.pseudo}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ville" className="text-right">
                  Ville
                </Label>
                <Input
                  id="ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              {isAddModalOpen && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
              )}
              
              {isAddModalOpen && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="age" className="text-right">
                    Âge
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
              )}
              
              {isEditModalOpen && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Statut
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: "active" | "inactive") => handleSelectChange("status", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Bloqué</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
              >
                Annuler
              </Button>
              <Button type="submit">
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </div>
  );
} 