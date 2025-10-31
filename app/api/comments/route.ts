import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase.server'
import { z } from 'zod'

const createCommentSchema = z.object({
  cardId: z.string().uuid(),
  body: z.string().min(1, 'Comment tidak boleh kosong'),
})

/**
 * POST /api/comments
 * Add comment ke card
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
    const validated = createCommentSchema.parse(body)

    // Check akses ke card (via column -> board)
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*, columns!inner(*, boards!inner(*))')
      .eq('id', validated.cardId)
      .single()

    if (cardError || !card) {
      return NextResponse.json(
        { error: 'Card tidak ditemukan' },
        { status: 404 }
      )
    }

    const column = (card as any).columns
    const board = column.boards
    const hasAccess =
      board.owner_id === user.id || board.members.includes(user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Anda tidak punya akses' },
        { status: 403 }
      )
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('comments')
      // @ts-ignore - Supabase type inference issue
      .insert({
        card_id: validated.cardId,
        author_id: user.id,
        body: validated.body,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ comment })
  } catch (error: any) {
    console.error('POST /api/comments error:', error)
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

