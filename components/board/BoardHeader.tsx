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
    <div className="sticky top-6 z-20">
      <div className="glass-card rounded-3xl px-5 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/5 hover:bg-white/10"
            onClick={() => router.push('/boards')}
            aria-label="Kembali ke boards"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-transparent bg-clip-text gradient-text drop-shadow-[0_0_18px_rgba(237,158,89,0.35)]">
              {board.title}
            </h1>
            <p className="text-xs text-white/60">Board Kanban realtime • {board.members.length} anggota</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsMembersOpen(true)} variant="ghost" size="sm" className="glass-card border-none px-4">
            <Users className="mr-2 h-4 w-4" />
            {board.members.length} Member
          </Button>
          <Button onClick={() => setIsInviteOpen(true)} size="sm" className="btn-gradient">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite
          </Button>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="glass-card border-none h-10 w-10 p-0 flex items-center justify-center">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-card border border-white/10 right-0">
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

