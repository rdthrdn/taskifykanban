// Database types sesuai skema Supabase

export type Profile = {
  id: string
  email: string | null
  name: string | null
  avatar_url: string | null
  created_at: string
}

export type Board = {
  id: string
  title: string
  owner_id: string
  members: string[]
  created_at: string
}

export type Column = {
  id: string
  board_id: string
  title: string
  order: number
  created_at: string
}

export type Card = {
  id: string
  column_id: string
  title: string
  description: string
  labels: string[]
  due_date: string | null
  assignees: string[]
  order: number
  created_at: string
}

export type Comment = {
  id: string
  card_id: string
  author_id: string
  body: string
  created_at: string
}

// Extended types untuk UI
export type BoardWithDetails = {
  board: Board
  columns: Column[]
  cards: Card[]
}

export type CommentWithAuthor = Comment & {
  author?: Profile
}

