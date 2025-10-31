'use client'

import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Board } from '@/lib/types'
import { toast } from '@/lib/utils'
import { useSupabase } from '@/providers/supabase-provider'

interface InviteDialogProps {
  board: Board
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteDialog({ board, open, onOpenChange }: InviteDialogProps) {
  const { supabase } = useSupabase()
  const queryClient = useQueryClient()
  const [userId, setUserId] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) {
      toast.error('User ID harus diisi')
      return
    }

    setIsLoading(true)
    try {
      // Check apakah user sudah member
      if (board.members.includes(userId)) {
        toast.error('User sudah menjadi member board ini')
        return
      }

      // Update members array
      const newMembers = [...board.members, userId]
      const { error } = await supabase
        .from('boards')
        .update({ members: newMembers })
        .eq('id', board.id)

      if (error) throw error

      toast.success('Member berhasil ditambahkan!')
      queryClient.invalidateQueries({ queryKey: ['board', board.id] })
      setUserId('')
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Gagal menambahkan member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Member ke Board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label htmlFor="userId" className="text-sm font-medium">
              User ID
            </label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="UUID user yang ingin diundang"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Untuk MVP, masukkan UUID user secara manual. Di production, bisa
              diganti dengan pencarian email.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menambahkan...' : 'Tambahkan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

