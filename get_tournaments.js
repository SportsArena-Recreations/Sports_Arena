import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://hebicrniymjeiwwyrsak.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY
)
// we don't have the env file sourced here, let's just grep the .env
