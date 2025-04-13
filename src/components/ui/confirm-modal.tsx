"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmModalProps {
  title: string
  description: string
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
  variant?: "destructive" | "default"
}

export function ConfirmModal({
  title,
  description,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  variant = "default"
}: ConfirmModalProps) {
  const confirmButtonVariant = variant === "destructive" ? "destructive" : "default"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button 
            variant={confirmButtonVariant} 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Chargement..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 