import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
console.log(process.env.VITE_SUPABASE_URL)
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)
const res = await sb.from('tournaments').select('*')
console.log(res.data)
