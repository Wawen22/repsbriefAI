// src/app/api/stats/route.ts
// Public endpoint — returns aggregated app stats for the landing page.
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin('api/stats')
    const { count, error } = await supabase
      .from('briefs')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json(
      { briefCount: count ?? 0 },
      { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch {
    return NextResponse.json({ briefCount: 0 })
  }
}
