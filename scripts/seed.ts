/**
 * Seed script untuk development
 * 
 * Usage:
 * npm run seed
 * 
 * Note: Anda harus sudah login minimal sekali untuk membuat profile
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY harus diset di .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log('🌱 Starting seed...')

  try {
    // Get current user (harus sudah login)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error(
        '❌ Tidak ada user yang login. Silakan login dulu di aplikasi untuk membuat profile.'
      )
      process.exit(1)
    }

    console.log('👤 User:', user.email)

    // Create sample board
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .insert({
        title: 'My First Kanban Board',
        owner_id: user.id,
        members: [user.id],
      })
      .select()
      .single()

    if (boardError) throw boardError
    console.log('✅ Board created:', board.title)

    // Create columns
    const columns = [
      { title: 'To Do', order: 100 },
      { title: 'In Progress', order: 200 },
      { title: 'Done', order: 300 },
    ]

    const createdColumns = []
    for (const col of columns) {
      const { data, error } = await supabase
        .from('columns')
        .insert({
          board_id: board.id,
          title: col.title,
          order: col.order,
        })
        .select()
        .single()

      if (error) throw error
      createdColumns.push(data)
      console.log('✅ Column created:', data.title)
    }

    // Create sample cards
    const cardsData = [
      {
        column_id: createdColumns[0].id,
        title: 'Setup project repository',
        description: 'Initialize Git and push to GitHub',
        labels: ['Setup', 'DevOps'],
        order: 100,
      },
      {
        column_id: createdColumns[0].id,
        title: 'Design database schema',
        description: 'Plan tables and relationships',
        labels: ['Backend', 'Database'],
        order: 200,
      },
      {
        column_id: createdColumns[1].id,
        title: 'Build authentication flow',
        description: 'Implement login with OTP',
        labels: ['Backend', 'Auth'],
        order: 100,
      },
      {
        column_id: createdColumns[1].id,
        title: 'Create UI components',
        description: 'Build reusable components with Tailwind',
        labels: ['Frontend', 'UI'],
        order: 200,
      },
      {
        column_id: createdColumns[2].id,
        title: 'Project initialization',
        description: 'Created Next.js project with TypeScript',
        labels: ['Setup'],
        order: 100,
      },
    ]

    for (const cardData of cardsData) {
      const { data, error } = await supabase
        .from('cards')
        .insert(cardData)
        .select()
        .single()

      if (error) throw error
      console.log('✅ Card created:', data.title)

      // Add sample comment to first card
      if (cardData.order === 100 && cardData.column_id === createdColumns[0].id) {
        await supabase.from('comments').insert({
          card_id: data.id,
          author_id: user.id,
          body: 'This is a sample comment. Great job on getting started! 🎉',
        })
        console.log('  💬 Comment added to card')
      }
    }

    console.log('\n🎉 Seed completed successfully!')
    console.log(`\n🔗 Visit: http://localhost:3000/boards/${board.id}`)
  } catch (error: any) {
    console.error('❌ Seed failed:', error.message)
    process.exit(1)
  }
}

seed()

