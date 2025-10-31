import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase.server'
import { z } from 'zod'

const reorderColumnsSchema = z.object({
  boardId: z.string().uuid(),
  ordered: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number(),
    })
  ),
})

/**
 * POST /api/columns/reorder
 * Reorder columns di board
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
    const validated = reorderColumnsSchema.parse(body)

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

    // Update setiap column dengan order baru
    const updates = validated.ordered.map(({ id, order }) =>
      // @ts-ignore - Supabase type inference issue
      supabase.from('columns').update({ order }).eq('id', id)
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('POST /api/columns/reorder error:', error)
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

