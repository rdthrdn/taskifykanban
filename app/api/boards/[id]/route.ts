import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase.server'

/**
 * GET /api/boards/:id
 * Return board detail dengan columns dan cards
 */
export async function GET(
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

    const boardId = params.id

    // Get board dan check akses
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .or(`owner_id.eq.${user.id},members.cs.{${user.id}}`)
      .single()

    if (boardError || !board) {
      return NextResponse.json(
        { error: 'Board tidak ditemukan atau Anda tidak punya akses' },
        { status: 404 }
      )
    }

    // Get columns
    const { data: columns, error: columnsError } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('order', { ascending: true })

    if (columnsError) throw columnsError

    // Get all cards untuk board ini
    const columnIds = (columns || []).map((c) => c.id)
    let cards: any[] = []

    if (columnIds.length > 0) {
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .in('column_id', columnIds)
        .order('order', { ascending: true })

      if (cardsError) throw cardsError
      cards = cardsData || []
    }

    return NextResponse.json({
      board,
      columns: columns || [],
      cards,
    })
  } catch (error: any) {
    console.error('GET /api/boards/[id] error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

