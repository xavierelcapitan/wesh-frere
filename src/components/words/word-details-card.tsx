"use client"

import { Word } from "@/types"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PenSquare, ThumbsUp, ThumbsDown } from "lucide-react"

interface WordDetailsCardProps {
  word: Word
  onEdit?: () => void
  showActions?: boolean
}

export function WordDetailsCard({ word, onEdit, showActions = true }: WordDetailsCardProps) {
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{word.word}</CardTitle>
            {word.origin && (
              <CardDescription>Origine: {word.origin}</CardDescription>
            )}
          </div>
          {word.isValidated ? (
            <Badge className="bg-green-100 text-green-800">Validé</Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">En attente</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Définition</h3>
            <p className="text-base whitespace-pre-line">{word.definition}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date d'ajout</h3>
              <p>{formatDate(word.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Votes</h3>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-1 text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{word.positiveVotes}</span>
                </div>
                <div className="flex items-center space-x-1 text-red-600">
                  <ThumbsDown className="h-4 w-4" />
                  <span>{word.negativeVotes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      {showActions && onEdit && (
        <CardFooter className="border-t pt-4">
          <Button variant="outline" size="sm" onClick={onEdit} className="ml-auto">
            <PenSquare className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </CardFooter>
      )}
    </Card>
  )
} 