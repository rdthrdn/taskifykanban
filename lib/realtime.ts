import { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase.browser'
import type { Column, Card } from '@/lib/types'

export type RealtimeChangePayload<T> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: T
  old: Partial<T>
  table: string
}

export type RealtimeCallback<T> = (payload: RealtimeChangePayload<T>) => void

/**
 * Subscribe ke perubahan columns dan cards untuk board tertentu
 */
export function subscribeToBoard(
  boardId: string,
  onColumnChange: RealtimeCallback<Column>,
  onCardChange: RealtimeCallback<Card>
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel(`board-${boardId}`)
    .on<Column>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'columns',
        filter: `board_id=eq.${boardId}`,
      },
      (payload) => {
        onColumnChange({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Column,
          old: payload.old as Partial<Column>,
          table: 'columns',
        })
      }
    )
    .on<Card>(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cards',
      },
      (payload) => {
        // Filter cards yang belong ke columns di board ini
        // Ini bisa di-improve dengan join query atau filter lebih spesifik
        onCardChange({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Card,
          old: payload.old as Partial<Card>,
          table: 'cards',
        })
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe dari channel
 */
export function unsubscribeFromBoard(channel: RealtimeChannel): void {
  channel.unsubscribe()
}

