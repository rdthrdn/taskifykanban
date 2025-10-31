'use client'

import * as React from 'react'
import { ArrowLeft, UserPlus, Settings, Edit2, Trash2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { InviteDialog } from './InviteDialog'
import { MembersDialog } from './MembersDialog'
import { useSupabase } from '@/providers/supabase-provider'
import type { Board } from '@/lib/types'
import { toast } from '@/lib/utils'

interface BoardHeaderProps {
  board: Board
}

async function updateBoard(boardId: string, title: string) {
  const res = await fetch(`/api/boards/${boardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal update board')
  }
  return res.json()
}

async function deleteBoard(boardId: string) {
  const res = await fetch(`/api/boards/${boardId}/delete`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal delete board')
  }
  return res.json()
}

export function BoardHeader({ board }: BoardHeaderProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()
  const [isInviteOpen, setIsInviteOpen] = React.useState(false)
  const [isMembersOpen, setIsMembersOpen] = React.useState(false)
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState(board.title)
  const [currentUser, setCurrentUser] = React.useState<any>(null)

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
  }, [supabase])

  const updateMutation = useMutation({
    mutationFn: ({ boardId, title }: { boardId: string; title: string }) =>
      updateBoard(boardId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] })
      setIsEditOpen(false)
      toast.success('Board berhasil diupdate!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => {
      toast.success('Board berhasil dihapus!')
      router.push('/boards')
      router.refresh()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const isOwner = currentUser?.id === board.owner_id

  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/boards')}
              aria-label="Kembali ke boards"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{board.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsMembersOpen(true)} variant="ghost" size="sm">
              <Users className="mr-2 h-4 w-4" />
              {board.members.length} Member
            </Button>
            <Button onClick={() => setIsInviteOpen(true)} variant="outline" size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite
            </Button>
            
            {/* Settings Menu - Only for Owner */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Board Title
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsDeleteOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    <span className="text-destructive">Delete Board</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <InviteDialog
        board={board}
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
      
      <MembersDialog
        board={board}
        open={isMembersOpen}
        onOpenChange={setIsMembersOpen}
      />

      {/* Edit Board Title Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Board Title</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Board title..."
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => updateMutation.mutate({ boardId: board.id, title: newTitle })}
              disabled={!newTitle.trim() || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Board Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Board?</DialogTitle>
            <DialogDescription>
              Board <strong>{board.title}</strong> beserta semua columns dan cards akan dihapus permanen. Aksi ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(board.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Board'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

