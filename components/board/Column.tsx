'use client'

import * as React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CardItem } from './CardItem'
import type { Column as ColumnType, Card as CardType } from '@/lib/types'
import { toast } from '@/lib/utils'

interface ColumnProps {
  column: ColumnType
  cards: CardType[]
  boardId: string
  onCardClick: (card: CardType) => void
}

async function createCard(columnId: string, title: string) {
  const res = await fetch('/api/cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ columnId, title }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal membuat card')
  }
  return res.json()
}

export function Column({ column, cards, boardId, onCardClick }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id })
  const queryClient = useQueryClient()
  const [isAddingCard, setIsAddingCard] = React.useState(false)
  const [newCardTitle, setNewCardTitle] = React.useState('')

  const createMutation = useMutation({
    mutationFn: ({ columnId, title }: { columnId: string; title: string }) =>
      createCard(columnId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      setNewCardTitle('')
      setIsAddingCard(false)
      toast.success('Card berhasil dibuat!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCardTitle.trim()) return
    createMutation.mutate({ columnId: column.id, title: newCardTitle })
  }

  const cardIds = cards.map((c) => c.id)

  return (
    <Card className="flex flex-col min-w-[320px] max-w-[320px] h-fit max-h-[calc(100vh-200px)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{column.title}</h3>
          <span className="text-sm text-muted-foreground">{cards.length}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-2" ref={setNodeRef}>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <CardItem key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>

        {isAddingCard ? (
          <form onSubmit={handleAddCard} className="space-y-2">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Judul card..."
              autoFocus
              disabled={createMutation.isPending}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={createMutation.isPending}
              >
                Tambah
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingCard(false)
                  setNewCardTitle('')
                }}
                disabled={createMutation.isPending}
              >
                Batal
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsAddingCard(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Card
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

