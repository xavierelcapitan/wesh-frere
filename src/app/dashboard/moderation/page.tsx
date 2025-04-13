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
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
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
import { 
  Eye, 
  Trash, 
  AlertTriangle, 
  Search,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Services
import { 
  CommentReportData, 
  getCommentById, 
  getPendingCommentReports,
  deleteComment,
  blockComment,
  updateCommentReportStatus
} from "@/services/comments";
import { 
  getUserById, 
  addWarningToUser 
} from "@/services/users";

// Helper pour formater les dates
function formatDate(timestamp: Timestamp | string | undefined): string {
  if (!timestamp) return "N/A";
  
  let date: Date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return "N/A";
  }
  
  return format(date, "dd MMMM yyyy 'à' HH:mm", { locale: fr });
}

// Interface pour les rapports enrichis avec données utilisateur
interface EnhancedReport extends CommentReportData {
  reporterName?: string;
  userName?: string;
  commentText?: string;
  commentDate?: string | Timestamp;
}

export default function ModerationPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<EnhancedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<EnhancedReport | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  
  // Charger les signalements
  const fetchReports = async () => {
    try {
      setLoading(true);
      const rawReports = await getPendingCommentReports();
      
      // Enrichir les rapports avec les données utilisateur et commentaire
      const enhancedReports = await Promise.all(
        rawReports.map(async (report) => {
          // Récupérer le commentaire
          const comment = await getCommentById(report.commentId);
          
          // Récupérer l'utilisateur signalé
          const reportedUser = await getUserById(report.userId);
          
          // Récupérer l'utilisateur qui signale
          const reporter = await getUserById(report.reporterId);
          
          return {
            ...report,
            reporterName: reporter?.pseudo || "Inconnu",
            userName: reportedUser?.pseudo || "Inconnu",
            commentText: comment?.text || "Commentaire supprimé",
            commentDate: comment?.createdAt
          } as EnhancedReport;
        })
      );
      
      setReports(enhancedReports);
    } catch (error) {
      console.error("Erreur lors du chargement des signalements:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les signalements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les données au chargement de la page
  useEffect(() => {
    fetchReports();
  }, []);
  
  // Filtrer les signalements
  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.userName?.toLowerCase().includes(searchLower) ||
      report.reporterName?.toLowerCase().includes(searchLower) ||
      report.commentText?.toLowerCase().includes(searchLower)
    );
  });
  
  // Voir les détails d'un commentaire signalé
  const handleViewDetails = (report: EnhancedReport) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };
  
  // Supprimer un commentaire sans avertissement
  const handleDeleteComment = async (report: EnhancedReport) => {
    try {
      // Bloquer le commentaire au lieu de le supprimer
      await blockComment(report.commentId);
      
      // Marquer le signalement comme traité
      await updateCommentReportStatus(report.id!, "reviewed");
      
      toast({
        title: "Commentaire bloqué",
        description: "Le commentaire a été bloqué et remplacé par un message standard",
      });
      
      // Rafraîchir la liste
      fetchReports();
    } catch (error) {
      console.error("Erreur lors du blocage du commentaire:", error);
      toast({
        title: "Erreur",
        description: "Impossible de bloquer le commentaire",
        variant: "destructive",
      });
    }
  };
  
  // Ouvrir la boîte de dialogue d'avertissement
  const handleWarnUser = (report: EnhancedReport) => {
    setSelectedReport(report);
    setWarningReason("");
    setIsWarningOpen(true);
  };
  
  // Supprimer le commentaire et avertir l'utilisateur
  const handleDeleteAndWarn = async () => {
    if (!selectedReport) return;
    
    try {
      // Bloquer le commentaire au lieu de le supprimer
      await blockComment(selectedReport.commentId);
      
      // Ajouter un avertissement à l'utilisateur
      const warnings = await addWarningToUser(
        selectedReport.userId, 
        warningReason || "Contenu inapproprié"
      );
      
      // Marquer le signalement comme traité
      await updateCommentReportStatus(selectedReport.id!, "reviewed");
      
      setIsWarningOpen(false);
      
      // Message approprié selon le nombre d'avertissements
      if (warnings >= 2) {
        toast({
          title: "Utilisateur banni",
          description: `L'utilisateur ${selectedReport.userName} a été automatiquement banni suite à plusieurs avertissements.`,
        });
      } else {
        toast({
          title: "Avertissement envoyé",
          description: `L'utilisateur ${selectedReport.userName} a reçu un avertissement et son commentaire a été bloqué.`,
        });
      }
      
      // Rafraîchir la liste
      fetchReports();
    } catch (error) {
      console.error("Erreur lors de l'avertissement de l'utilisateur:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'avertir l'utilisateur",
        variant: "destructive",
      });
    }
  };
  
  // Ignorer le signalement
  const handleDismissReport = async (report: EnhancedReport) => {
    try {
      await updateCommentReportStatus(report.id!, "dismissed");
      
      toast({
        title: "Signalement ignoré",
        description: "Le signalement a été marqué comme ignoré",
      });
      
      // Rafraîchir la liste
      fetchReports();
    } catch (error) {
      console.error("Erreur lors de l'ignorement du signalement:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ignorer le signalement",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Modération des commentaires</CardTitle>
          <CardDescription>
            Gérez les commentaires signalés par les utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReports}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Chargement en cours...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm 
                ? "Aucun résultat trouvé pour cette recherche" 
                : "Aucun commentaire signalé à modérer"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date du commentaire</TableHead>
                  <TableHead>Date du signalement</TableHead>
                  <TableHead>Utilisateur signalé</TableHead>
                  <TableHead>Signalé par</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{formatDate(report.commentDate)}</TableCell>
                    <TableCell>{formatDate(report.createdAt)}</TableCell>
                    <TableCell>{report.userName}</TableCell>
                    <TableCell>{report.reporterName}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(report)}
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Bloquer le commentaire"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bloquer le commentaire</AlertDialogTitle>
                              <AlertDialogDescription>
                                Voulez-vous bloquer ce commentaire sans avertir l'utilisateur ? Le commentaire sera remplacé par un message standard.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteComment(report)}>
                                Confirmer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-yellow-600 hover:text-yellow-700"
                          onClick={() => handleWarnUser(report)}
                          title="Supprimer et avertir l'utilisateur"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Modale de détails du commentaire */}
      {selectedReport && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Détails du commentaire signalé</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div>
                <h3 className="font-medium mb-1">Commentaire</h3>
                <p className="p-3 bg-muted rounded-md">{selectedReport.commentText}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Auteur</h3>
                  <p>{selectedReport.userName}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Date du commentaire</h3>
                  <p>{formatDate(selectedReport.commentDate)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-1">Signalé par</h3>
                  <p>{selectedReport.reporterName}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Date du signalement</h3>
                  <p>{formatDate(selectedReport.createdAt)}</p>
                </div>
              </div>
              
              {selectedReport.reason && (
                <div>
                  <h3 className="font-medium mb-1">Raison du signalement</h3>
                  <p className="p-3 bg-muted rounded-md">{selectedReport.reason}</p>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => handleDismissReport(selectedReport)}>
                Ignorer le signalement
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Bloquer le commentaire</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Bloquer le commentaire</AlertDialogTitle>
                    <AlertDialogDescription>
                      Voulez-vous bloquer ce commentaire sans avertir l'utilisateur ? Le commentaire sera remplacé par un message standard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      setIsDetailsOpen(false);
                      handleDeleteComment(selectedReport);
                    }}>
                      Confirmer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button 
                variant="default" 
                className="bg-yellow-600 hover:bg-yellow-700"
                onClick={() => {
                  setIsDetailsOpen(false);
                  handleWarnUser(selectedReport);
                }}
              >
                Supprimer et avertir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Modale d'avertissement */}
      {selectedReport && (
        <Dialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Envoyer un avertissement</DialogTitle>
              <DialogDescription>
                L'utilisateur <span className="font-medium">{selectedReport.userName}</span> recevra un avertissement.
                Après 2 avertissements, l'utilisateur est automatiquement banni.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Label htmlFor="warningReason" className="mb-2 block">
                Raison de l'avertissement
              </Label>
              <Textarea
                id="warningReason"
                placeholder="Décrivez la raison de cet avertissement..."
                value={warningReason}
                onChange={(e) => setWarningReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsWarningOpen(false)}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAndWarn}
              >
                Supprimer et avertir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <Toaster />
    </div>
  );
} 