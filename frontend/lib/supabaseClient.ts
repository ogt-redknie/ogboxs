import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hioesncqzppcvandomjj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_CWKTwugG1HEhoXVivRjK3A_hiHfFIEm'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Generate a deterministic, bidirectional chat ID for 1-on-1 conversations.
 * Both addresses are lowercased and sorted alphabetically before joining with '_'.
 * getChatId(A, B) === getChatId(B, A) always.
 */
export function getChatId(addrA: string, addrB: string): string {
  return [addrA.toLowerCase(), addrB.toLowerCase()].sort().join('_')
}
