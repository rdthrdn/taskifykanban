'use client'

import * as React from 'react'
import { Users, Crown, X } from 'lucide-react'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Board, Profile } from '@/lib/types'
import { toast } from '@/lib/utils'
import { useSupabase } from '@/providers/supabase-provider'

interface MembersDialogProps {
  board: Board
  open: boolean
  onOpenChange: (open: boolean) => void
}

async function fetchProfiles(userIds: string[]) {
  // Fetch profiles from Supabase directly
  const { createClient } = await import('@/lib/supabase.browser')
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds)

  if (error) throw error
  return data as Profile[]
}

async function removeMember(boardId: string, userId: string, members: string[]) {
  const { createClient } = await import('@/lib/supabase.browser')
  const supabase = createClient()
  
  const newMembers = members.filter((id) => id !== userId)
  
  const { error } = await supabase
    .from('boards')
    .update({ members: newMembers })
    .eq('id', boardId)

  if (error) throw error
  return { success: true }
}

export function MembersDialog({ board, open, onOpenChange }: MembersDialogProps) {
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()
  const [currentUser, setCurrentUser] = React.useState<any>(null)

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
  }, [supabase])

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['profiles', board.members],
    queryFn: () => fetchProfiles(board.members),
    enabled: open && board.members.length > 0,
  })

  const removeMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      removeMember(board.id, userId, board.members),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', board.id] })
      toast.success('Member berhasil dihapus!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const isOwner = currentUser?.id === board.owner_id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members ({board.members.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Loading members...
            </p>
          ) : profiles && profiles.length > 0 ? (
            profiles.map((profile) => {
              const isBoardOwner = profile.id === board.owner_id
              const isCurrentUser = profile.id === currentUser?.id
              
              return (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {profile.name || profile.email || 'Unknown User'}
                        {isCurrentUser && (
                          <span className="text-xs text-muted-foreground ml-2">(You)</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isBoardOwner && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Owner
                      </Badge>
                    )}
                    {isOwner && !isBoardOwner && !isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMutation.mutate({ userId: profile.id })}
                        disabled={removeMutation.isPending}
                        aria-label="Remove member"
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada members
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

