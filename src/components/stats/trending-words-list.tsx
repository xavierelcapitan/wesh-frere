"use client"

import { Word } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TrendingWordsListProps {
  words: Word[]
  limit?: number
}

export function TrendingWordsList({ words, limit = 5 }: TrendingWordsListProps) {
  // Trier par nombre de votes positifs décroissant
  const sortedWords = [...words]
    .sort((a, b) => b.positiveVotes - a.positiveVotes)
    .slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mots tendance</span>
        </CardTitle>
        <CardDescription>Les mots les plus appréciés par les utilisateurs</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedWords.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Aucun mot tendance disponible
          </div>
        ) : (
          <div className="space-y-4">
            {sortedWords.map((word) => (
              <div key={word.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{word.word}</p>
                  <p className="text-sm text-gray-500 truncate max-w-[300px]">{word.definition}</p>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{word.positiveVotes}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {words.length > limit && (
          <div className="mt-4 flex justify-center">
            <Link href="/dashboard/words" passHref>
              <Button variant="outline" size="sm">
                Voir tous les mots
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 