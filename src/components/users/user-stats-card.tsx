"use client"

import { User } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, Calendar, PenSquare, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserStatsCardProps {
  user: User
}

export function UserStatsCard({ user }: UserStatsCardProps) {
  // Fonction pour formater la date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Jamais"
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
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
  
  const stats = [
    {
      title: "Compte créé le",
      value: formatDate(user.createdAt),
      icon: Calendar,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Dernière connexion",
      value: formatDate(user.lastLogin),
      icon: UserIcon,
      iconColor: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Votes émis",
      value: user.votesCount?.toString() || "0",
      icon: ThumbsUp,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      title: "Suggestions envoyées",
      value: user.suggestionsCount?.toString() || "0",
      icon: PenSquare,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50"
    }
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{user.name}</CardTitle>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="flex space-x-2">
            {getRoleBadge(user.role)}
            {getStatusBadge(user.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`${stat.bgColor} p-2 rounded-full`}>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="font-medium">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 