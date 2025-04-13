"use client"

import { useState } from "react"
import { Word } from "@/types"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MoreHorizontal, 
  PenSquare, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ConfirmModal } from "@/components/ui/confirm-modal"

interface WordTableProps {
  words: Word[]
  onEdit: (word: Word) => void
  onDelete: (word: Word) => void
  onValidate: (word: Word) => void
}

export function WordTable({ words, onEdit, onDelete, onValidate }: WordTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, word: Word | null }>({
    isOpen: false,
    word: null
  })
  const [validateConfirm, setValidateConfirm] = useState<{ isOpen: boolean, word: Word | null }>({
    isOpen: false,
    word: null
  })
  
  const ITEMS_PER_PAGE = 10
  
  // Filtrer les mots en fonction du terme de recherche
  const filteredWords = words.filter(word => 
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.definition.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Pagination
  const totalPages = Math.ceil(filteredWords.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedWords = filteredWords.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const confirmDelete = (word: Word) => {
    setDeleteConfirm({ isOpen: true, word })
  }
  
  const handleDelete = () => {
    if (deleteConfirm.word) {
      onDelete(deleteConfirm.word)
      setDeleteConfirm({ isOpen: false, word: null })
    }
  }
  
  const confirmValidate = (word: Word) => {
    setValidateConfirm({ isOpen: true, word })
  }
  
  const handleValidate = () => {
    if (validateConfirm.word) {
      onValidate(validateConfirm.word)
      setValidateConfirm({ isOpen: false, word: null })
    }
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Rechercher un mot..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-gray-500">
          {filteredWords.length} mot{filteredWords.length !== 1 ? 's' : ''} trouvé{filteredWords.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mot</TableHead>
              <TableHead>Définition</TableHead>
              <TableHead>Date d'ajout</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Votes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedWords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Aucun mot trouvé
                </TableCell>
              </TableRow>
            ) : (
              paginatedWords.map((word) => (
                <TableRow key={word.id}>
                  <TableCell className="font-medium">{word.word}</TableCell>
                  <TableCell className="max-w-md truncate">{word.definition}</TableCell>
                  <TableCell>{formatDate(word.createdAt)}</TableCell>
                  <TableCell>
                    {word.isValidated ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Validé</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 hover:bg-yellow-50">En attente</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">+{word.positiveVotes}</span>
                      <span>/</span>
                      <span className="text-red-600">-{word.negativeVotes}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(word)}>
                          <PenSquare className="mr-2 h-4 w-4" />
                          <span>Modifier</span>
                        </DropdownMenuItem>
                        {!word.isValidated && (
                          <DropdownMenuItem onClick={() => confirmValidate(word)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Valider</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => confirmDelete(word)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Supprimer</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
        title="Supprimer le mot"
        description={`Êtes-vous sûr de vouloir supprimer le mot "${deleteConfirm.word?.word}" ? Cette action est irréversible.`}
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, word: null })}
        onConfirm={handleDelete}
        variant="destructive"
      />
      
      <ConfirmModal
        title="Valider le mot"
        description={`Êtes-vous sûr de vouloir valider le mot "${validateConfirm.word?.word}" ? Il sera visible par tous les utilisateurs.`}
        isOpen={validateConfirm.isOpen}
        onClose={() => setValidateConfirm({ isOpen: false, word: null })}
        onConfirm={handleValidate}
      />
    </div>
  )
} 