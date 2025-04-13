"use client"

import { Suggestion } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"

interface SuggestionModalProps {
  suggestion: Suggestion | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (suggestion: Suggestion, comments?: string) => void
  onReject?: (suggestion: Suggestion, comments?: string) => void
}

export function SuggestionModal({
  suggestion,
  isOpen,
  onClose,
  onApprove,
  onReject
}: SuggestionModalProps) {
  const [comments, setComments] = useState("")
  const [loading, setLoading] = useState(false)

  if (!suggestion) {
    return null
  }

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Gérer l'approbation d'une suggestion
  const handleApprove = async () => {
    if (!suggestion || !onApprove) return
    
    try {
      setLoading(true)
      await onApprove(suggestion, comments)
      onClose()
    } catch (error) {
      console.error("Erreur lors de l'approbation de la suggestion:", error)
    } finally {
      setLoading(false)
    }
  }

  // Gérer le rejet d'une suggestion
  const handleReject = async () => {
    if (!suggestion || !onReject) return
    
    try {
      setLoading(true)
      await onReject(suggestion, comments)
      onClose()
    } catch (error) {
      console.error("Erreur lors du rejet de la suggestion:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour afficher le badge de statut
  const getStatusBadge = (status: Suggestion['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800">En attente</Badge>
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="text-xl">{suggestion.word}</div>
            {getStatusBadge(suggestion.status)}
          </DialogTitle>
          <DialogDescription>
            Soumis le {formatDate(suggestion.createdAt)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Définition</h3>
            <p className="text-base whitespace-pre-line">{suggestion.definition}</p>
          </div>
          
          {suggestion.origin && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Origine</h3>
              <p>{suggestion.origin}</p>
            </div>
          )}
          
          {suggestion.status !== 'pending' && suggestion.comments && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Commentaires</h3>
              <p className="text-sm">{suggestion.comments}</p>
            </div>
          )}
          
          {suggestion.status === 'pending' && (onApprove || onReject) && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Commentaires (optionnel)</h3>
              <Textarea
                placeholder="Ajoutez vos commentaires ici..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          {suggestion.status === 'pending' && (
            <>
              {onReject && (
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={handleReject}
                  disabled={loading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </Button>
              )}
              {onApprove && (
                <Button 
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
              )}
            </>
          )}
          <Button 
            onClick={onClose}
            disabled={loading}
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 