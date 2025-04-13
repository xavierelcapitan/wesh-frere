"use client"

import { useState } from "react"
import { Suggestion } from "@/types"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react"
import { ConfirmModal } from "@/components/ui/confirm-modal"

interface SuggestionListProps {
  suggestions: Suggestion[]
  onView: (suggestion: Suggestion) => void
  onApprove: (suggestion: Suggestion) => void
  onReject: (suggestion: Suggestion) => void
}

export function SuggestionList({ 
  suggestions, 
  onView, 
  onApprove, 
  onReject 
}: SuggestionListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [approveConfirm, setApproveConfirm] = useState<{ isOpen: boolean, suggestion: Suggestion | null }>({
    isOpen: false,
    suggestion: null
  })
  const [rejectConfirm, setRejectConfirm] = useState<{ isOpen: boolean, suggestion: Suggestion | null }>({
    isOpen: false,
    suggestion: null
  })
  
  const ITEMS_PER_PAGE = 10
  
  // Filtrer les suggestions en fonction du terme de recherche
  const filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suggestion.definition.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Pagination
  const totalPages = Math.ceil(filteredSuggestions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedSuggestions = filteredSuggestions.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }
  
  const confirmApprove = (suggestion: Suggestion) => {
    setApproveConfirm({ isOpen: true, suggestion })
  }
  
  const handleApprove = () => {
    if (approveConfirm.suggestion) {
      onApprove(approveConfirm.suggestion)
      setApproveConfirm({ isOpen: false, suggestion: null })
    }
  }
  
  const confirmReject = (suggestion: Suggestion) => {
    setRejectConfirm({ isOpen: true, suggestion })
  }
  
  const handleReject = () => {
    if (rejectConfirm.suggestion) {
      onReject(rejectConfirm.suggestion)
      setRejectConfirm({ isOpen: false, suggestion: null })
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Rechercher une suggestion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-gray-500">
          {filteredSuggestions.length} suggestion{filteredSuggestions.length !== 1 ? 's' : ''} trouvée{filteredSuggestions.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mot</TableHead>
              <TableHead>Définition</TableHead>
              <TableHead>Date de soumission</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSuggestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Aucune suggestion trouvée
                </TableCell>
              </TableRow>
            ) : (
              paginatedSuggestions.map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell className="font-medium">{suggestion.word}</TableCell>
                  <TableCell className="max-w-md truncate">{suggestion.definition}</TableCell>
                  <TableCell>{formatDate(suggestion.createdAt)}</TableCell>
                  <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(suggestion)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      {suggestion.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => confirmApprove(suggestion)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => confirmReject(suggestion)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
      
      <ConfirmModal
        title="Approuver la suggestion"
        description={`Êtes-vous sûr de vouloir approuver la suggestion "${approveConfirm.suggestion?.word}" ? Un nouveau mot sera créé et sera visible par tous les utilisateurs.`}
        isOpen={approveConfirm.isOpen}
        onClose={() => setApproveConfirm({ isOpen: false, suggestion: null })}
        onConfirm={handleApprove}
      />
      
      <ConfirmModal
        title="Rejeter la suggestion"
        description={`Êtes-vous sûr de vouloir rejeter la suggestion "${rejectConfirm.suggestion?.word}" ?`}
        isOpen={rejectConfirm.isOpen}
        onClose={() => setRejectConfirm({ isOpen: false, suggestion: null })}
        onConfirm={handleReject}
        variant="destructive"
      />
    </div>
  )
} 