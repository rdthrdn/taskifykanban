'use client'

import * as React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { DndProvider } from '@/components/dnd/DndProvider'
import { DragOverlayCard } from '@/components/dnd/DragOverlayCard'
import { Column } from './Column'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import type { Column as ColumnType, Card as CardType } from '@/lib/types'
import { calcOrder } from '@/lib/ordering'
import { toast } from '@/lib/utils'

interface BoardColumnsProps {
  boardId: string
  columns: ColumnType[]
  cards: CardType[]
  onCardClick: (card: CardType) => void
}

async function createColumn(boardId: string, title: string) {
  const res = await fetch('/api/columns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ boardId, title }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal membuat column')
  }
  return res.json()
}

async function reorderCard(payload: {
  boardId: string
  cardId: string
  toColumnId: string
  newOrder: number
}) {
  const res = await fetch('/api/cards/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Gagal memindahkan card')
  return res.json()
}

export function BoardColumns({
  boardId,
  columns,
  cards,
  onCardClick,
}: BoardColumnsProps) {
  const queryClient = useQueryClient()
  const [activeCard, setActiveCard] = React.useState<CardType | null>(null)
  const [isAddingColumn, setIsAddingColumn] = React.useState(false)
  const [newColumnTitle, setNewColumnTitle] = React.useState('')

  const createColumnMutation = useMutation({
    mutationFn: ({ boardId, title }: { boardId: string; title: string }) =>
      createColumn(boardId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      setNewColumnTitle('')
      setIsAddingColumn(false)
      toast.success('Column berhasil dibuat!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const reorderMutation = useMutation({
    mutationFn: reorderCard,
    onMutate: async (payload) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['board', boardId] })
      const previousData = queryClient.getQueryData(['board', boardId])

      queryClient.setQueryData(['board', boardId], (old: any) => {
        if (!old) return old
        const newCards = old.cards.map((c: CardType) =>
          c.id === payload.cardId
            ? { ...c, column_id: payload.toColumnId, order: payload.newOrder }
            : c
        )
        return { ...old, cards: newCards }
      })

      return { previousData }
    },
    onError: (_err, _vars, context) => {
      // Rollback
      if (context?.previousData) {
        queryClient.setQueryData(['board', boardId], context.previousData)
      }
      toast.error('Gagal memindahkan card')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id)
    if (card) setActiveCard(card)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null)

    const { active, over } = event
    if (!over) return

    const activeCardId = active.id as string
    const overColumnId = over.id as string

    const activeCard = cards.find((c) => c.id === activeCardId)
    if (!activeCard) return

    // Cek apakah over adalah column atau card
    const targetColumn = columns.find((col) => col.id === overColumnId)
    const targetCard = cards.find((c) => c.id === overColumnId)

    let toColumnId: string
    let newOrder: number

    if (targetColumn) {
      // Drop ke column (akhir list)
      toColumnId = targetColumn.id
      const cardsInColumn = cards.filter((c) => c.column_id === toColumnId)
      const maxOrder =
        cardsInColumn.length > 0
          ? Math.max(...cardsInColumn.map((c) => c.order))
          : 0
      newOrder = maxOrder + 100
    } else if (targetCard) {
      // Drop ke card (insert sebelum card target)
      toColumnId = targetCard.column_id
      const cardsInColumn = cards
        .filter((c) => c.column_id === toColumnId)
        .sort((a, b) => a.order - b.order)
      const targetIndex = cardsInColumn.findIndex((c) => c.id === targetCard.id)
      const prevCard = targetIndex > 0 ? cardsInColumn[targetIndex - 1] : undefined
      const nextCard = cardsInColumn[targetIndex]
      newOrder = calcOrder(prevCard?.order, nextCard?.order)
    } else {
      return
    }

    reorderMutation.mutate({
      boardId,
      cardId: activeCardId,
      toColumnId,
      newOrder,
    })
  }

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColumnTitle.trim()) return
    createColumnMutation.mutate({ boardId, title: newColumnTitle })
  }

  return (
    <DndProvider
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      overlay={activeCard ? <DragOverlayCard card={activeCard} /> : null}
    >
      <div className="flex gap-4 overflow-x-auto p-6">
        {columns.map((column) => {
          const columnCards = cards
            .filter((c) => c.column_id === column.id)
            .sort((a, b) => a.order - b.order)
          return (
            <Column
              key={column.id}
              column={column}
              cards={columnCards}
              boardId={boardId}
              onCardClick={onCardClick}
            />
          )
        })}

        {/* Add Column */}
        <Card className="min-w-[320px] max-w-[320px] p-4">
          {isAddingColumn ? (
            <form onSubmit={handleAddColumn} className="space-y-2">
              <Input
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Judul column..."
                autoFocus
                disabled={createColumnMutation.isPending}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={createColumnMutation.isPending}
                >
                  Tambah
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingColumn(false)
                    setNewColumnTitle('')
                  }}
                  disabled={createColumnMutation.isPending}
                >
                  Batal
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setIsAddingColumn(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Column
            </Button>
          )}
        </Card>
      </div>
    </DndProvider>
  )
}

