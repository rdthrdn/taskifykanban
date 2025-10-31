'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { BoardHeader } from '@/components/board/BoardHeader'
import { BoardColumns } from '@/components/board/BoardColumns'
import { CardModal } from '@/components/board/CardModal'
import { useRealtimeBoard } from '@/lib/hooks/useRealtimeBoard'
import type { Board, Column, Card as CardType } from '@/lib/types'

async function fetchBoardDetail(boardId: string) {
  const res = await fetch(`/api/boards/${boardId}`)
  if (!res.ok) throw new Error('Gagal memuat board')
  return res.json()
}

export default function BoardDetailPage() {
  const params = useParams()
  const boardId = params.id as string
  const [selectedCard, setSelectedCard] = React.useState<CardType | null>(null)

  const { data, isLoading, error } = useQuery<{
    board: Board
    columns: Column[]
    cards: CardType[]
  }>({
    queryKey: ['board', boardId],
    queryFn: () => fetchBoardDetail(boardId),
  })

  // Subscribe ke realtime updates
  useRealtimeBoard(boardId)

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Memuat board...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">
          Error: {error?.message || 'Board tidak ditemukan'}
        </p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <BoardHeader board={data.board} />
      <div className="flex-1 overflow-hidden">
        <BoardColumns
          boardId={boardId}
          columns={data.columns}
          cards={data.cards}
          onCardClick={setSelectedCard}
        />
      </div>
      <CardModal
        card={selectedCard}
        boardId={boardId}
        open={!!selectedCard}
        onOpenChange={(open) => !open && setSelectedCard(null)}
      />
    </div>
  )
}

