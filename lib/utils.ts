import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// Simple toast notification utility
export const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      // Fallback sederhana, bisa diganti dengan library toast yang lebih lengkap
      console.log('✅', message)
      alert(message)
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      console.error('❌', message)
      alert(`Error: ${message}`)
    }
  },
  info: (message: string) => {
    if (typeof window !== 'undefined') {
      console.log('ℹ️', message)
    }
  },
}

