// src/app/api/test/email/route.ts

import { createClient } from "@/lib/supabase/server"
import { sendWeeklyBriefEmail } from "@/lib/mail"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Recuperiamo l'ultimo brief dell'utente per avere dati reali
  const { data: brief } = await supabase
    .from('briefs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!brief) {
    return NextResponse.json({ error: "No brief found to test with. Generate one first." }, { status: 404 })
  }

  const result = await sendWeeklyBriefEmail({
    email: user.email!,
    nicheLabel: brief.niche,
    ideas: brief.ideas,
    userName: user.user_metadata?.full_name || 'Creator'
  })

  if (result.success) {
    return NextResponse.json({ message: "Test email sent successfully to " + user.email })
  } else {
    return NextResponse.json({ error: "Failed to send email", details: result.error }, { status: 500 })
  }
}
