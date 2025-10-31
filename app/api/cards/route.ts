import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase.server'
import { z } from 'zod'

const createCardSchema = z.object({
  columnId: z.string().uuid(),
  title: z.string().min(1, 'Title harus diisi'),
})

const updateCardSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  labels: z.array(z.string()).optional(),
  due_date: z.string().nullable().optional(),
  assignees: z.array(z.string()).optional(),
})

/**
 * POST /api/cards
 * Create card baru di column
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
    const validated = createCardSchema.parse(body)

    // Check akses ke column (via board)
    const { data: column, error: columnError } = await supabase
      .from('columns')
      .select('*, boards!inner(*)')
      .eq('id', validated.columnId)
      .single()

    if (columnError || !column) {
      return NextResponse.json(
        { error: 'Column tidak ditemukan' },
        { status: 404 }
      )
    }

    const board = (column as any).boards
    const hasAccess =
      board.owner_id === user.id || board.members.includes(user.id)

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Anda tidak punya akses ke board ini' },
        { status: 403 }
      )
    }

    // Get max order untuk column ini
    const { data: maxOrderCard } = await supabase
      .from('cards')
      .select('order')
      .eq('column_id', validated.columnId)
      .order('order', { ascending: false })
      .limit(1)
      .single()

    const newOrder = maxOrderCard ? maxOrderCard.order + 100 : 100

    // Create card
    const { data: card, error } = await supabase
      .from('cards')
      .insert({
        column_id: validated.columnId,
        title: validated.title,
        description: '',
        labels: [],
        assignees: [],
        order: newOrder,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ card })
  } catch (error: any) {
    console.error('POST /api/cards error:', error)
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

/**
 * PATCH /api/cards
 * Update card (title, description, labels, due_date, assignees)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateCardSchema.parse(body)

    // Check akses ke card (via column -> board)
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*, columns!inner(*, boards!inner(*))')
      .eq('id', validated.id)
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

    // Build update object (hanya field yang ada)
    const updates: any = {}
    if (validated.title !== undefined) updates.title = validated.title
    if (validated.description !== undefined)
      updates.description = validated.description
    if (validated.labels !== undefined) updates.labels = validated.labels
    if (validated.due_date !== undefined) updates.due_date = validated.due_date
    if (validated.assignees !== undefined)
      updates.assignees = validated.assignees

    const { data: updatedCard, error } = await supabase
      .from('cards')
      .update(updates)
      .eq('id', validated.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ card: updatedCard })
  } catch (error: any) {
    console.error('PATCH /api/cards error:', error)
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

