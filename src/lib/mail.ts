// src/lib/mail.ts

import { Resend } from 'resend';
import { WeeklyBriefEmail } from '@/components/email/WeeklyBriefEmail';
import { IdeaObject } from '@/types/niche';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWeeklyBriefEmail({
  email,
  nicheLabel,
  ideas,
  userName
}: {
  email: string;
  nicheLabel: string;
  ideas: IdeaObject[];
  userName?: string;
}) {
  try {
    // In Sandbox mode (senza dominio verificato), Resend accetta solo 'onboarding@resend.dev' come mittente
    // e l'email del proprietario dell'account come destinatario.
    const { data, error } = await resend.emails.send({
      from: 'RepsBrief <onboarding@resend.dev>',
      to: [email],
      subject: `Your Weekly Brief: ${ideas.length} strategies for ${nicheLabel}`,
      react: WeeklyBriefEmail({ nicheLabel, ideas, userName }),
    });

    if (error) {
      console.error('[Resend Error]:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Mail Exception]:', error);
    return { success: false, error };
  }
}

export async function sendWelcomeSequenceEmail(
  email: string,
  userName: string,
  day: 1 | 3 | 7
): Promise<{ success: boolean }> {
  const subjects: Record<number, string> = {
    1: 'Your content strategy studio is ready',
    3: "Have you generated your first brief?",
    7: "Creators on Pro publish 4x more — here's why",
  }

  const bodies: Record<number, string> = {
    1: `
      <h2 style="font-size:22px;font-weight:900;margin:0 0 16px;color:#f1f5f9">Hey ${userName || 'Creator'} 👋</h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px">Your RepsBrief studio is live. Three things to do right now:</p>
      <ol style="color:#94a3b8;line-height:2;padding-left:20px;margin:0 0 24px">
        <li><strong style="color:#f1f5f9">Train your AI voice</strong> — upload 2 writing samples and every brief will sound like you</li>
        <li><strong style="color:#f1f5f9">Generate your first brief</strong> — 20 trend-backed ideas in 30 seconds</li>
        <li><strong style="color:#f1f5f9">Save your best ideas</strong> — move them to your Kanban board</li>
      </ol>
      <a href="https://repsbrief.com/dashboard" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:12px;font-weight:900;text-decoration:none;font-size:13px;letter-spacing:0.05em;text-transform:uppercase">Open My Studio →</a>
    `,
    3: `
      <h2 style="font-size:22px;font-weight:900;margin:0 0 16px;color:#f1f5f9">Your first brief is 30 seconds away</h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px">We noticed you haven't generated your first brief yet. Our engine has already scraped this week's top trends for your niche — it just needs you to hit Generate.</p>
      <a href="https://repsbrief.com/dashboard" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:12px;font-weight:900;text-decoration:none;font-size:13px;letter-spacing:0.05em;text-transform:uppercase">Generate My Brief →</a>
    `,
    7: `
      <h2 style="font-size:22px;font-weight:900;margin:0 0 16px;color:#f1f5f9">The difference between free and Pro</h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px">Free gives you a taste. Pro gives you the whole engine:</p>
      <ul style="color:#94a3b8;line-height:2;padding-left:20px;margin:0 0 24px">
        <li><strong style="color:#f1f5f9">Daily briefs</strong> instead of weekly</li>
        <li><strong style="color:#f1f5f9">All 20 strategies</strong> unlocked (free shows 5)</li>
        <li><strong style="color:#f1f5f9">AI Brand Voice</strong> trained on your writing</li>
        <li><strong style="color:#f1f5f9">Editorial calendar</strong> synced to Google Calendar</li>
      </ul>
      <a href="https://repsbrief.com/dashboard/settings?tab=billing" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:12px;font-weight:900;text-decoration:none;font-size:13px;letter-spacing:0.05em;text-transform:uppercase">Upgrade to Pro — $19/mo →</a>
    `,
  }

  try {
    const { error } = await resend.emails.send({
      from: 'RepsBrief <onboarding@resend.dev>',
      to: [email],
      subject: subjects[day],
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050505;color:#f1f5f9;padding:40px;border-radius:16px">
          ${bodies[day]}
          <p style="color:#475569;font-size:12px;margin-top:40px">RepsBrief · repsbrief.com</p>
        </div>
      `,
    })
    if (error) {
      console.error(`[Mail] Day ${day} sequence error:`, error)
      return { success: false }
    }
    return { success: true }
  } catch (err) {
    console.error(`[Mail] Day ${day} sequence exception:`, err)
    return { success: false }
  }
}

export async function sendBriefReadyEmail(
  email: string,
  userName: string,
  nicheLabel: string,
  isPro: boolean
): Promise<{ success: boolean }> {
  const subject = isPro
    ? `Your daily brief is ready — 20 new ${nicheLabel} ideas`
    : `Your weekly brief is ready — 20 ${nicheLabel} ideas this week`

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#050505;color:#f1f5f9;padding:40px;border-radius:16px">
      <h2 style="font-size:22px;font-weight:900;margin:0 0 8px;color:#f1f5f9">
        Your ${isPro ? 'daily' : 'weekly'} brief is ready 🚀
      </h2>
      <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6">
        Hey ${userName || 'Creator'} — 20 trend-backed ${nicheLabel} content ideas are waiting for you in your Studio.
      </p>

      <div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px;margin:0 0 28px">
        <p style="color:#64748b;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px">What&apos;s inside this brief</p>
        <ul style="color:#94a3b8;line-height:2;padding-left:20px;margin:0;font-size:14px">
          <li><strong style="color:#f1f5f9">20 AI-curated ideas</strong> filtered from Reddit, YouTube & Google Trends</li>
          <li><strong style="color:#f1f5f9">Hook + script</strong> ready to record for each idea</li>
          <li><strong style="color:#f1f5f9">Format mix</strong> — Reels, Carousels, Threads, Newsletters</li>
        </ul>
      </div>

      <a href="https://repsbrief.com/dashboard" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:12px;font-weight:900;text-decoration:none;font-size:13px;letter-spacing:0.05em;text-transform:uppercase">
        Open My Brief →
      </a>

      ${!isPro ? `
      <div style="margin-top:32px;padding:20px;border:1px solid #1e293b;border-radius:12px">
        <p style="color:#64748b;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px">Want briefs every day?</p>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 12px">Pro users get 20 fresh ideas daily + full scripts + AI remix. Try it free for 7 days.</p>
        <a href="https://repsbrief.com/dashboard/settings?tab=billing" style="color:#60a5fa;font-size:13px;font-weight:700;text-decoration:none">Upgrade to Pro — 7-day free trial →</a>
      </div>
      ` : ''}

      <p style="color:#475569;font-size:12px;margin-top:40px">RepsBrief · repsbrief.com</p>
    </div>
  `

  try {
    const { error } = await resend.emails.send({
      from: 'RepsBrief <onboarding@resend.dev>',
      to: [email],
      subject,
      html,
    })
    if (error) {
      console.error('[Mail] Brief ready email error:', error)
      return { success: false }
    }
    return { success: true }
  } catch (err) {
    console.error('[Mail] Brief ready email exception:', err)
    return { success: false }
  }
}
