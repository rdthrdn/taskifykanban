import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase.server'
import { z } from 'zod'

const updateBoardSchema = z.object({
  title: z.string().min(1, 'Title harus diisi'),
})

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

/**
 * PATCH /api/boards/:id
 * Update board title
 */
export async function PATCH(
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
    const body = await request.json()
    const validated = updateBoardSchema.parse(body)

    // Check ownership
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', boardId)
      .eq('owner_id', user.id)
      .single()

    if (boardError || !board) {
      return NextResponse.json(
        { error: 'Board tidak ditemukan atau Anda bukan owner' },
        { status: 403 }
      )
    }

    // Update board
    const { data: updatedBoard, error } = await supabase
      .from('boards')
      .update({ title: validated.title })
      .eq('id', boardId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ board: updatedBoard })
  } catch (error: any) {
    console.error('PATCH /api/boards/[id] error:', error)
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

