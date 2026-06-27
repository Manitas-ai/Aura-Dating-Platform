import { createClient } from '@supabase/supabase-js'

// Replace these with your Supabase project values
// Found at: Supabase Dashboard → Project Settings → API
const SUPABASE_URL  = 'https://jevvjgmssurktybjmjqe.supabase.co'
const SUPABASE_ANON = 'sb_publishable_nBbAfDACZdSmE2Xtb8NBqw_gNFukS8A'

export const db = createClient(SUPABASE_URL, SUPABASE_ANON)
