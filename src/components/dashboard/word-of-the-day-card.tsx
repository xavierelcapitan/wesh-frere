"use client"

import { Word, WordOfTheDay } from "@/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Eye, RotateCw } from "lucide-react"
import { useState } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface WordOfTheDayCardProps {
  wordOfTheDay: WordOfTheDay & { word: Word }
  onRefresh?: () => Promise<void>
}

export function WordOfTheDayCard({ wordOfTheDay, onRefresh }: WordOfTheDayCardProps) {
  const [loading, setLoading] = useState(false)
  
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date)
  }
  
  // Gérer le rafraîchissement du mot du jour
  const handleRefresh = async () => {
    if (!onRefresh) return
    
    try {
      setLoading(true)
      await onRefresh()
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du mot du jour:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">
          Mot du jour
        </CardTitle>
        <div className="flex items-center space-x-1 text-gray-500 text-sm">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(wordOfTheDay.date)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">{wordOfTheDay.word.word}</h3>
          
          {wordOfTheDay.word.origin && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Origine:</span> {wordOfTheDay.word.origin}
            </div>
          )}
          
          <div>
            <p className="whitespace-pre-line">{wordOfTheDay.word.definition}</p>
          </div>
          
          <div className="flex items-center mt-4 text-gray-500 text-sm">
            <Eye className="h-4 w-4 mr-1" />
            <span>{wordOfTheDay.viewCount} vues</span>
          </div>
        </div>
      </CardContent>
      {onRefresh && (
        <CardFooter className="pt-0 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Rafraîchissement...</span>
              </div>
            ) : (
              <>
                <RotateCw className="h-4 w-4 mr-2" />
                Changer le mot du jour
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
} 