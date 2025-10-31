import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase.server'

/**
 * DELETE /api/boards/:id/delete
 * Delete board (cascade delete columns & cards)
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

    const boardId = params.id

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

    // Delete board (cascade akan delete columns & cards)
    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', boardId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/boards/[id]/delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

