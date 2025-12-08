import { createClient } from '@supabase/supabase-js'

// Note: This client should ONLY be used in Server Actions or Server Components.
// It requires SUPABASE_SERVICE_ROLE_KEY in .env
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
  // Fallback allowing RLS if key missing, but ideally needs Service Key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
