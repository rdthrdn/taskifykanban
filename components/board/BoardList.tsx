'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text gradient-text drop-shadow-[0_0_25px_rgba(237,158,89,0.35)]">
            Boards
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <Plus className="mr-2 h-4 w-4" />
                Buat Board
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-none bg-black/70 text-white">
            <DialogHeader>
              <DialogTitle className="text-transparent bg-clip-text gradient-text">Buat Board Baru</DialogTitle>
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
                  className="bg-white/10 border-white/15 text-white"
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
                <Button type="submit" className="btn-gradient" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Membuat...' : 'Buat Board'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full glass-card h-10 w-10 p-0 flex items-center justify-center">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="right-0">
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

      {isLoading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Memuat boards...</p>
        </div>
      ) : !boards || boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-card rounded-3xl border px-10">
          <p className="text-muted-foreground mb-4">
            Belum ada board. Mulai dengan membuat board baru!
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Buat Board Pertama
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board, idx) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
            >
              <Card
                className="glass-card cursor-pointer border-none transition-transform hover:-translate-y-1"
                onClick={() => router.push(`/boards/${board.id}`)}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-white">
                      {board.title}
                    </CardTitle>
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <CardDescription className="text-xs text-white/60">
                    Dibuat {new Date(board.created_at).toLocaleDateString('id-ID')}
                  </CardDescription>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="px-2 py-1 rounded-full bg-primary/20 border border-primary/30">
                      Board aktif
                    </span>
                    <span className="px-2 py-1 rounded-full bg-accent/10 border border-accent/25">
                      Kanban
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

