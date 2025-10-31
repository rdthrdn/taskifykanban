'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Calendar, Tag, User, MessageSquare, Trash2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Card, Comment } from '@/lib/types'
import { toast } from '@/lib/utils'
import { useSupabase } from '@/providers/supabase-provider'

interface CardModalProps {
  card: Card | null
  boardId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const cardSchema = z.object({
  title: z.string().min(1, 'Title harus diisi'),
  description: z.string(),
  labels: z.string(), // comma-separated
  due_date: z.string().nullable(),
  assignees: z.string(), // comma-separated user IDs
})

type CardFormData = z.infer<typeof cardSchema>

async function updateCard(cardId: string, data: Partial<Card>) {
  const res = await fetch('/api/cards', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: cardId, ...data }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal update card')
  }
  return res.json()
}

async function fetchComments(cardId: string): Promise<Comment[]> {
  const { createClient } = await import('@/lib/supabase.browser')
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

async function addComment(cardId: string, body: string) {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardId, body }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal menambahkan comment')
  }
  return res.json()
}

async function deleteCard(cardId: string) {
  const res = await fetch(`/api/cards/${cardId}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal delete card')
  }
  return res.json()
}

export function CardModal({ card, boardId, open, onOpenChange }: CardModalProps) {
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()
  const [commentBody, setCommentBody] = React.useState('')
  const [currentUser, setCurrentUser] = React.useState<any>(null)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
  }, [supabase])

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['comments', card?.id],
    queryFn: () => fetchComments(card!.id),
    enabled: !!card,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
  })

  React.useEffect(() => {
    if (card) {
      reset({
        title: card.title,
        description: card.description || '',
        labels: card.labels.join(', '),
        due_date: card.due_date || '',
        assignees: card.assignees?.join(', ') || '',
      })
    }
  }, [card, reset])

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Card>) => updateCard(card!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      toast.success('Card berhasil diupdate!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const commentMutation = useMutation({
    mutationFn: ({ cardId, body }: { cardId: string; body: string }) =>
      addComment(cardId, body),
    onSuccess: () => {
      refetchComments()
      setCommentBody('')
      toast.success('Comment berhasil ditambahkan!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      toast.success('Card berhasil dihapus!')
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (data: CardFormData) => {
    const labels = data.labels
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l)

    const assignees = data.assignees
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a)

    updateMutation.mutate({
      title: data.title,
      description: data.description,
      labels,
      due_date: data.due_date || null,
      assignees,
    })
  }

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim() || !card) return
    commentMutation.mutate({ cardId: card.id, body: commentBody })
  }

  if (!card) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Card</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              {...register('title')}
              disabled={updateMutation.isPending}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Description
            </label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="labels" className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Labels (pisahkan dengan koma)
            </label>
            <Input
              id="labels"
              {...register('labels')}
              placeholder="Frontend, Backend, Bug"
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="due_date" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date
            </label>
            <Input
              id="due_date"
              type="date"
              {...register('due_date')}
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="assignees" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Assignees (pisahkan dengan koma, user IDs)
            </label>
            <Input
              id="assignees"
              {...register('assignees')}
              placeholder="user-id-1, user-id-2"
              disabled={updateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Untuk MVP, masukkan user IDs. Di production bisa diganti dengan select dropdown members.
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={updateMutation.isPending} className="flex-1">
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteOpen(true)}
              disabled={updateMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </form>

        {/* Comments Section */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold">Comments</h3>

          <form onSubmit={handleAddComment} className="space-y-2">
            <Textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Tulis comment..."
              rows={3}
              disabled={commentMutation.isPending}
            />
            <Button
              type="submit"
              size="sm"
              disabled={commentMutation.isPending || !commentBody.trim()}
            >
              {commentMutation.isPending ? 'Menambahkan...' : 'Tambah Comment'}
            </Button>
          </form>

          <div className="space-y-3">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border rounded-lg p-3 space-y-1"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{comment.author_id.substring(0, 8)}...</span>
                    <span>•</span>
                    <span>
                      {new Date(comment.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-sm">{comment.body}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada comment
              </p>
            )}
          </div>
        </div>
      </SheetContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Card?</DialogTitle>
            <DialogDescription>
              Card <strong>{card.title}</strong> akan dihapus permanen. Aksi ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate(card.id)
                setIsDeleteOpen(false)
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  )
}

