import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin('api/email/waitlist')

    // Upsert — silently ignore duplicates
    const { error: databaseError } = await supabase
      .from('waitlist_emails')
      .upsert({ email: email.trim().toLowerCase(), source: 'hero' }, { onConflict: 'email', ignoreDuplicates: true })
    if (databaseError) throw databaseError

    const from = process.env.RESEND_FROM_EMAIL
    if (!from) {
      console.warn('[Waitlist] Lead saved but RESEND_FROM_EMAIL is not configured')
      return NextResponse.json({ success: true, emailDelivery: false })
    }

    const { error: emailError } = await resend.emails.send({
      from,
      to: [email.trim().toLowerCase()],
      subject: 'Create your RepsBrief account',
      html: '<p>Create your account at <a href="https://repsbrief.com/signup">repsbrief.com/signup</a>.</p>',
    })
    if (emailError) {
      console.error('[Waitlist] Lead saved but invitation could not be sent:', emailError)
    }

    return NextResponse.json({ success: true, emailDelivery: !emailError })
  } catch (err) {
    console.error('[Waitlist] Error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
