'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, User, LogOut } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useSupabase } from '@/providers/supabase-provider'
import type { Board } from '@/lib/types'
import { toast } from '@/lib/utils'

async function fetchBoards(): Promise<Board[]> {
  const res = await fetch('/api/boards')
  if (!res.ok) throw new Error('Gagal memuat boards')
  const data = await res.json()
  return data.boards
}

async function createBoard(title: string): Promise<Board> {
  const res = await fetch('/api/boards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Gagal membuat board')
  }
  const data = await res.json()
  return data.board
}

export function BoardList() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newBoardTitle, setNewBoardTitle] = React.useState('')
  const [currentUser, setCurrentUser] = React.useState<any>(null)

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
  }, [supabase])

  const { data: boards, isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: fetchBoards,
  })

  const createMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
      setIsDialogOpen(false)
      setNewBoardTitle('')
      toast.success('Board berhasil dibuat!')
      router.push(`/boards/${newBoard.id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoardTitle.trim()) {
      toast.error('Judul board harus diisi')
      return
    }
    createMutation.mutate(newBoardTitle)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Logout berhasil!')
    router.push('/login')
    router.refresh()
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat boards...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Boards</h1>
          <p className="text-muted-foreground">
            Kelola proyek Anda dengan Kanban boards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Buat Board
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Buat Board Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label htmlFor="title" className="text-sm font-medium">
                  Judul Board
                </label>
                <Input
                  id="title"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="My Awesome Project"
                  autoFocus
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={createMutation.isPending}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Membuat...' : 'Buat Board'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-4 py-2 text-sm">
              <p className="font-medium">{currentUser?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Taskify Kanban
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>

      {!boards || boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">
            Belum ada board. Mulai dengan membuat board baru!
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Board Pertama
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => router.push(`/boards/${board.id}`)}
            >
              <CardHeader>
                <CardTitle>{board.title}</CardTitle>
                <CardDescription>
                  Dibuat {new Date(board.created_at).toLocaleDateString('id-ID')}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

