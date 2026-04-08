import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://whsnniynbiwkddpbwrky.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhb3NxdXVhem9rZGNpa3ZnbW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTE2MTcsImV4cCI6MjA5MTIyNzYxN30.u3ZW10pk6glAhYPCc_ps3XdbXilRcizq8TANq93n6H8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)



/*import { createClient } from '@supabase/supabase-js'

// Cliente público (solo lectura según RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Cliente admin (acceso completo, solo usar en API Routes del servidor)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)*/