"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  color?: 'primary' | 'white'
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '',
  color = 'primary'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const colorClasses = {
    primary: 'text-primary',
    white: 'text-white'
  }

  return (
    <div role="status" className={cn("animate-spin", sizeClasses[size], colorClasses[color], className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="w-full h-full"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="sr-only">Chargement...</span>
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export function LoadingSection() {
  return (
    <div className="w-full py-12 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
} 