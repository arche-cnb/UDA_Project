import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function getProfileRole(userId) {
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (error) return null
  return data?.role ?? null
}