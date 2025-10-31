import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase.server'
import { z } from 'zod'

const createBoardSchema = z.object({
  title: z.string().min(1, 'Title harus diisi'),
})

/**
 * GET /api/boards
 * Return list boards di mana user adalah owner atau member
 */
export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get boards dimana user adalah owner atau ada di members array
    const { data: boards, error } = await supabase
      .from('boards')
      .select('*')
      .or(`owner_id.eq.${user.id},members.cs.{${user.id}}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ boards: boards || [] })
  } catch (error: any) {
    console.error('GET /api/boards error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/boards
 * Create board baru
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
    const validated = createBoardSchema.parse(body)

    const { data: board, error } = await supabase
      .from('boards')
      // @ts-ignore - Supabase type inference issue
      .insert({
        title: validated.title,
        owner_id: user.id,
        members: [user.id], // Owner juga member
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ board })
  } catch (error: any) {
    console.error('POST /api/boards error:', error)
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

