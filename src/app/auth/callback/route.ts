// src/app/auth/callback/route.ts
// Handles Supabase email confirmation and password-reset links.
// Supabase appends ?code=xxx to the emailRedirectTo URL.
// We exchange the code for a session, then redirect the user.
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // `next` lets callers (e.g. password-reset email) specify where to land after exchange
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — send user to login with a readable error
  return NextResponse.redirect(`${origin}/login?error=link_expired`)
}
