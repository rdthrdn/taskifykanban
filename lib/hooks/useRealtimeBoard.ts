import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeToBoard, unsubscribeFromBoard } from '@/lib/realtime'
import type { Column, Card } from '@/lib/types'

/**
 * Hook untuk subscribe ke realtime updates board
 * Otomatis update React Query cache saat ada perubahan
 */
export function useRealtimeBoard(boardId: string) {
  const queryClient = useQueryClient()

  React.useEffect(() => {
    const channel = subscribeToBoard(
      boardId,
      // Column changes
      (payload) => {
        console.log('Column change:', payload)
        
        queryClient.setQueryData(['board', boardId], (old: any) => {
          if (!old) return old

          let newColumns = [...old.columns]

          if (payload.eventType === 'INSERT') {
            // Tambah column baru
            newColumns.push(payload.new)
          } else if (payload.eventType === 'UPDATE') {
            // Update column
            newColumns = newColumns.map((col: Column) =>
              col.id === payload.new.id ? payload.new : col
            )
          } else if (payload.eventType === 'DELETE') {
            // Hapus column
            newColumns = newColumns.filter((col: Column) => col.id !== payload.old.id)
          }

          // Sort by order
          newColumns.sort((a: Column, b: Column) => a.order - b.order)

          return { ...old, columns: newColumns }
        })

        // Invalidate untuk refresh dari server
        queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      },
      // Card changes
      (payload) => {
        console.log('Card change:', payload)

        queryClient.setQueryData(['board', boardId], (old: any) => {
          if (!old) return old

          let newCards = [...old.cards]

          if (payload.eventType === 'INSERT') {
            // Tambah card baru
            newCards.push(payload.new)
          } else if (payload.eventType === 'UPDATE') {
            // Update card
            newCards = newCards.map((card: Card) =>
              card.id === payload.new.id ? payload.new : card
            )
          } else if (payload.eventType === 'DELETE') {
            // Hapus card
            newCards = newCards.filter((card: Card) => card.id !== payload.old.id)
          }

          return { ...old, cards: newCards }
        })

        // Invalidate untuk refresh dari server
        queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      }
    )

    return () => {
      unsubscribeFromBoard(channel)
    }
  }, [boardId, queryClient])
}

