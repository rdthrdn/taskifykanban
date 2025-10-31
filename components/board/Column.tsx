'use client'

import * as React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
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

async function updateColumn(columnId: string, title: string) {
  const res = await fetch(`/api/columns/${columnId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal update column')
  }
  return res.json()
}

async function deleteColumn(columnId: string) {
  const res = await fetch(`/api/columns/${columnId}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal delete column')
  }
  return res.json()
}

export function Column({ column, cards, boardId, onCardClick }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: column.id })
  const queryClient = useQueryClient()
  const [isAddingCard, setIsAddingCard] = React.useState(false)
  const [newCardTitle, setNewCardTitle] = React.useState('')
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState(column.title)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

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

  const updateMutation = useMutation({
    mutationFn: ({ columnId, title }: { columnId: string; title: string }) =>
      updateColumn(columnId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      setIsEditingTitle(false)
      toast.success('Column berhasil diupdate!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
      setEditedTitle(column.title)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      toast.success('Column berhasil dihapus!')
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

  const handleUpdateTitle = () => {
    if (!editedTitle.trim()) {
      toast.error('Title tidak boleh kosong')
      setEditedTitle(column.title)
      setIsEditingTitle(false)
      return
    }
    if (editedTitle === column.title) {
      setIsEditingTitle(false)
      return
    }
    updateMutation.mutate({ columnId: column.id, title: editedTitle })
  }

  const cardIds = cards.map((c) => c.id)

  return (
    <>
      <Card className="flex flex-col min-w-[320px] max-w-[320px] h-fit max-h-[calc(100vh-200px)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            {isEditingTitle ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdateTitle()
                    if (e.key === 'Escape') {
                      setEditedTitle(column.title)
                      setIsEditingTitle(false)
                    }
                  }}
                  autoFocus
                  className="h-8 text-sm"
                  disabled={updateMutation.isPending}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleUpdateTitle}
                  disabled={updateMutation.isPending}
                  className="h-8 w-8"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditedTitle(column.title)
                    setIsEditingTitle(false)
                  }}
                  disabled={updateMutation.isPending}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-1 group">
                  <h3 className="font-semibold">{column.title}</h3>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsEditingTitle(true)}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Edit column title"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">{cards.length}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsDeleteOpen(true)}
                    className="h-6 w-6"
                    aria-label="Delete column"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </>
            )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Column?</DialogTitle>
            <DialogDescription>
              Column <strong>{column.title}</strong> dan <strong>{cards.length} card</strong> akan dihapus permanen. Aksi ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate(column.id)
                setIsDeleteOpen(false)
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Column'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

