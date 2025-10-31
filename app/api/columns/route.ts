import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase.server'
import { z } from 'zod'

const createColumnSchema = z.object({
  boardId: z.string().uuid(),
  title: z.string().min(1, 'Title harus diisi'),
})

/**
 * POST /api/columns
 * Create column baru di board
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
    const validated = createColumnSchema.parse(body)

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

    // Get max order untuk board ini
    const { data: maxOrderColumn } = await supabase
      .from('columns')
      .select('order')
      .eq('board_id', validated.boardId)
      .order('order', { ascending: false })
      .limit(1)
      .single()

    const newOrder = maxOrderColumn ? maxOrderColumn.order + 100 : 100

    // Create column
    const { data: column, error } = await supabase
      .from('columns')
      .insert({
        board_id: validated.boardId,
        title: validated.title,
        order: newOrder,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ column })
  } catch (error: any) {
    console.error('POST /api/columns error:', error)
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

