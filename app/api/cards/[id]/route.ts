import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase.server'

/**
 * DELETE /api/cards/:id
 * Delete card
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cardId = params.id

    // Check akses ke card (via column -> board)
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*, columns!inner(*, boards!inner(*))')
      .eq('id', cardId)
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

    // Delete card
    const { error } = await supabase.from('cards').delete().eq('id', cardId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/cards/[id] error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

