"use client"

import { useState } from "react"
import { User } from "@/types"
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
  Ban, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ConfirmModal } from "@/components/ui/confirm-modal"

interface UserTableProps {
  users: User[]
  onView: (user: User) => void
  onToggleStatus: (user: User, newStatus: User['status']) => void
  onDelete: (user: User) => void
  onRoleChange?: (user: User, newRole: User['role']) => void
}

export function UserTable({ 
  users, 
  onView, 
  onToggleStatus, 
  onDelete,
  onRoleChange
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, user: User | null }>({
    isOpen: false,
    user: null
  })
  const [statusConfirm, setStatusConfirm] = useState<{ isOpen: boolean, user: User | null, newStatus: User['status'] }>({
    isOpen: false,
    user: null,
    newStatus: 'active'
  })
  
  const ITEMS_PER_PAGE = 10
  
  // Filtrer les utilisateurs en fonction du terme de recherche
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  
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
  
  const confirmDelete = (user: User) => {
    setDeleteConfirm({ isOpen: true, user })
  }
  
  const handleDelete = () => {
    if (deleteConfirm.user) {
      onDelete(deleteConfirm.user)
      setDeleteConfirm({ isOpen: false, user: null })
    }
  }
  
  const confirmToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    setStatusConfirm({ isOpen: true, user, newStatus })
  }
  
  const handleToggleStatus = () => {
    if (statusConfirm.user && statusConfirm.newStatus) {
      onToggleStatus(statusConfirm.user, statusConfirm.newStatus)
      setStatusConfirm({ isOpen: false, user: null, newStatus: 'active' })
    }
  }
  
  // Fonction pour obtenir le badge du rôle
  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Admin</Badge>
      case 'editor':
        return <Badge className="bg-blue-100 text-blue-800">Éditeur</Badge>
      case 'user':
        return <Badge variant="outline">Utilisateur</Badge>
      default:
        return null
    }
  }
  
  // Fonction pour obtenir le badge du statut
  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case 'inactive':
        return <Badge variant="destructive">Inactif</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-gray-500">
          {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date d'inscription</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
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
                        <DropdownMenuItem onClick={() => onView(user)}>
                          <PenSquare className="mr-2 h-4 w-4" />
                          <span>Détails</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmToggleStatus(user)}>
                          {user.status === 'active' ? (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              <span>Désactiver</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="mr-2 h-4 w-4" />
                              <span>Activer</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        {onRoleChange && user.role !== 'admin' && (
                          <DropdownMenuItem
                            onClick={() => onRoleChange(user, user.role === 'user' ? 'editor' : 'user')}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            <span>
                              {user.role === 'user' ? 'Promouvoir en éditeur' : 'Rétrograder en utilisateur'}
                            </span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => confirmDelete(user)}
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
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${deleteConfirm.user?.name}" ? Cette action est irréversible.`}
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, user: null })}
        onConfirm={handleDelete}
        variant="destructive"
      />
      
      <ConfirmModal
        title={statusConfirm.newStatus === 'active' ? "Activer l'utilisateur" : "Désactiver l'utilisateur"}
        description={`Êtes-vous sûr de vouloir ${statusConfirm.newStatus === 'active' ? 'activer' : 'désactiver'} l'utilisateur "${statusConfirm.user?.name}" ?`}
        isOpen={statusConfirm.isOpen}
        onClose={() => setStatusConfirm({ isOpen: false, user: null, newStatus: 'active' })}
        onConfirm={handleToggleStatus}
        variant={statusConfirm.newStatus === 'inactive' ? "destructive" : "default"}
      />
    </div>
  )
} 