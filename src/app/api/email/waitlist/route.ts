import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin('api/email/waitlist')

    // Upsert — silently ignore duplicates
    await supabase
      .from('waitlist_emails')
      .upsert({ email, source: 'hero' }, { onConflict: 'email', ignoreDuplicates: true })

    // Send welcome email
    await resend.emails.send({
      from: 'RepsBrief <onboarding@resend.dev>',
      to: [email],
      subject: 'Your free content brief is waiting 🚀',
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050505;color:#f1f5f9;padding:40px;border-radius:16px">
          <h1 style="font-size:28px;font-weight:900;margin:0 0 12px">Welcome to RepsBrief.</h1>
          <p style="color:#94a3b8;font-size:16px;line-height:1.6;margin:0 0 24px">
            You're about to get 20 AI-powered content strategies based on real trends — Reddit, YouTube, Google Trends — delivered every week.
          </p>
          <a href="https://repsbrief.com/signup" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:12px;font-weight:900;text-decoration:none;font-size:14px;letter-spacing:0.05em;text-transform:uppercase">
            Create Your Free Account →
          </a>
          <p style="color:#475569;font-size:12px;margin-top:32px">RepsBrief · repsbrief.com</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[Waitlist] Error:', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
