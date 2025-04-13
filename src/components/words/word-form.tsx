"use client"

import { useState } from "react"
import { Word } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Schema de validation pour le formulaire
const wordFormSchema = z.object({
  word: z
    .string()
    .min(1, "Le mot est requis")
    .max(50, "Le mot ne peut pas dépasser 50 caractères"),
  definition: z
    .string()
    .min(10, "La définition doit contenir au moins 10 caractères")
    .max(500, "La définition ne peut pas dépasser 500 caractères"),
  origin: z
    .string()
    .max(200, "L'origine ne peut pas dépasser 200 caractères")
    .optional(),
  isValidated: z.boolean().default(false)
})

type WordFormValues = z.infer<typeof wordFormSchema>

interface WordFormProps {
  initialData?: Word
  onSubmit: (data: WordFormValues) => Promise<void>
  onCancel: () => void
}

export function WordForm({ initialData, onSubmit, onCancel }: WordFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!initialData
  
  const form = useForm<WordFormValues>({
    resolver: zodResolver(wordFormSchema),
    defaultValues: initialData ? {
      word: initialData.word,
      definition: initialData.definition,
      origin: initialData.origin || "",
      isValidated: initialData.isValidated
    } : {
      word: "",
      definition: "",
      origin: "",
      isValidated: false
    }
  })

  const handleSubmit = async (values: WordFormValues) => {
    try {
      setLoading(true)
      await onSubmit(values)
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Modifier le mot" : "Ajouter un nouveau mot"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le mot" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="definition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Définition</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Entrez la définition du mot"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origine (optionnel)</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez l'origine du mot" {...field} />
                  </FormControl>
                  <FormDescription>
                    Vous pouvez préciser l'origine du mot, son étymologie ou sa provenance.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isValidated"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mot validé</FormLabel>
                    <FormDescription>
                      Cochez cette case pour que le mot soit immédiatement visible par tous les utilisateurs.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>En cours...</span>
                </div>
              ) : (
                isEditing ? "Mettre à jour" : "Ajouter"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
} 