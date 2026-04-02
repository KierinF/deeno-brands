import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Service role client — bypasses RLS. Only use in server-side webhook routes
// protected by a secret header, never in browser or user-facing code.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
