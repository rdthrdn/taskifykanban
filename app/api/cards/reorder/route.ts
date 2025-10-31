import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase.server'
import { z } from 'zod'

const reorderCardSchema = z.object({
  boardId: z.string().uuid(),
  cardId: z.string().uuid(),
  toColumnId: z.string().uuid(),
  newOrder: z.number(),
})

/**
 * POST /api/cards/reorder
 * Move/reorder card ke column lain atau dalam column yang sama
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = reorderCardSchema.parse(body)

    // Check akses ke board
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', validated.boardId)
      .or(`owner_id.eq.${user.id},members.cs.{${user.id}}`)
      .single()

    if (boardError || !board) {
      return NextResponse.json(
        { error: 'Board tidak ditemukan atau Anda tidak punya akses' },
        { status: 403 }
      )
    }

    // Update card dengan column_id baru dan order baru
    const { data: card, error } = await supabase
      .from('cards')
      // @ts-ignore - Supabase type inference issue
      .update({
        column_id: validated.toColumnId,
        order: validated.newOrder,
      })
      .eq('id', validated.cardId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ card })
  } catch (error: any) {
    console.error('POST /api/cards/reorder error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

