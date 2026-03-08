// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Standard client for frontend/authenticated requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for backend/cron jobs/bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey ?? supabaseAnonKey)

let serviceRoleWarningShown = false

export function getSupabaseAdmin(context: string) {
  if (supabaseServiceKey) {
    return supabaseAdmin
  }

  const message = `[SupabaseAdmin] SUPABASE_SERVICE_ROLE_KEY missing (${context}).`
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${message} Refusing anon fallback in production.`)
  }

  if (!serviceRoleWarningShown) {
    console.warn(`${message} Using anon fallback outside production.`)
    serviceRoleWarningShown = true
  }

  return supabaseAdmin
}
