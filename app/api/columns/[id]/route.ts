import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase.server'
import { z } from 'zod'

const updateColumnSchema = z.object({
  title: z.string().min(1, 'Title harus diisi'),
})

/**
 * PATCH /api/columns/:id
 * Update column title
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

    const columnId = params.id
    const body = await request.json()
    const validated = updateColumnSchema.parse(body)

    // Check akses ke column (via board)
    const { data: column, error: columnError } = await supabase
      .from('columns')
      .select('*, boards!inner(*)')
      .eq('id', columnId)
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
        { error: 'Anda tidak punya akses' },
        { status: 403 }
      )
    }

    // Update column
    const { data: updatedColumn, error } = await supabase
      .from('columns')
      .update({ title: validated.title })
      .eq('id', columnId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ column: updatedColumn })
  } catch (error: any) {
    console.error('PATCH /api/columns/[id] error:', error)
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
 * DELETE /api/columns/:id
 * Delete column (cascade delete cards)
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

    const columnId = params.id

    // Check akses ke column (via board)
    const { data: column, error: columnError } = await supabase
      .from('columns')
      .select('*, boards!inner(*)')
      .eq('id', columnId)
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
        { error: 'Anda tidak punya akses' },
        { status: 403 }
      )
    }

    // Delete column (cascade akan delete cards)
    const { error } = await supabase
      .from('columns')
      .delete()
      .eq('id', columnId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/columns/[id] error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

