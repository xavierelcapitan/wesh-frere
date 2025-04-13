"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  BookText, 
  ThumbsUp, 
  ThumbsDown, 
  Clock,
  ActivitySquare
} from "lucide-react"

interface StatsCardsProps {
  totalUsers: number
  totalWords: number
  positiveVotes: number
  negativeVotes: number
  pendingSuggestions: number
  totalViews: number
}

export function StatsCards({
  totalUsers,
  totalWords,
  positiveVotes,
  negativeVotes,
  pendingSuggestions,
  totalViews
}: StatsCardsProps) {
  // Calcul des ratios
  const totalVotes = positiveVotes + negativeVotes
  const positiveRatio = totalVotes > 0 ? Math.round((positiveVotes / totalVotes) * 100) : 0
  
  const stats = [
    {
      title: "Total Utilisateurs",
      value: totalUsers,
      icon: Users,
      description: "Utilisateurs enregistrés",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Total Mots",
      value: totalWords,
      icon: BookText,
      description: "Mots dans le dictionnaire",
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Votes Positifs",
      value: positiveVotes,
      percentage: `${positiveRatio}%`,
      icon: ThumbsUp,
      description: "du total des votes",
      iconColor: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Votes Négatifs",
      value: negativeVotes,
      percentage: `${100 - positiveRatio}%`,
      icon: ThumbsDown,
      description: "du total des votes",
      iconColor: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      title: "Suggestions",
      value: pendingSuggestions,
      icon: Clock,
      description: "En attente de validation",
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Vues Totales",
      value: totalViews,
      icon: ActivitySquare,
      description: "Tous mots confondus",
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <div className={`${stat.bgColor} p-2 rounded-full`}>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.value.toLocaleString('fr-FR')}
              {stat.percentage && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({stat.percentage})
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 