// src/app/api/email/sendBrief.ts

import { Resend } from 'resend'
import { WeeklyBriefEmail } from '@/components/email/WeeklyBriefEmail'
import { BriefData, NicheConfig } from '@/types/niche'
import * as React from 'react'
import { getEmailSender } from '@/lib/mail'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendBrief(
  userEmail: string, 
  brief: BriefData, 
  niche: NicheConfig,
  userName?: string
): Promise<void> {
  if (!resend) {
    console.error('[Email] Cannot send email: RESEND_API_KEY is missing in environment variables.')
    return
  }
  const from = getEmailSender()
  if (!from) {
    console.error('[Email] Cannot send email: RESEND_FROM_EMAIL is missing in production.')
    return
  }
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [userEmail],
      subject: `Your Weekly Brief: ${brief.ideas.length} new strategies for ${niche.label}`,
      react: WeeklyBriefEmail({ 
        nicheLabel: niche.label, 
        ideas: brief.ideas,
        userName: userName 
      }) as React.ReactElement,
    })

    if (error) {
      throw new Error(`Resend error: ${error.message}`)
    }

    console.log(`[Email] Sent brief to ${userEmail} (ID: ${data?.id})`)
  } catch (err) {
    console.error(`[Email] Failed to send brief to ${userEmail}:`, err)
    throw err
  }
}
