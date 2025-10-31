import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase.server'

/**
 * Helper untuk mendapatkan user di Server Component
 * Jika tidak ada user, redirect ke login
 */
export async function getUserOrRedirect() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Helper untuk mendapatkan user tanpa redirect
 * Return null jika tidak ada user
 */
export async function getUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

