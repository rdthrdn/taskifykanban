'use client'

import * as React from 'react'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { InviteDialog } from './InviteDialog'
import type { Board } from '@/lib/types'

interface BoardHeaderProps {
  board: Board
}

export function BoardHeader({ board }: BoardHeaderProps) {
  const router = useRouter()
  const [isInviteOpen, setIsInviteOpen] = React.useState(false)

  return (
    <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/boards')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{board.title}</h1>
              <p className="text-sm text-muted-foreground">
                {board.members.length} member
              </p>
            </div>
          </div>
          <Button onClick={() => setIsInviteOpen(true)} variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </div>
      <InviteDialog
        board={board}
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  )
}

