// src/app/api/email/sendBrief.ts

import { Resend } from 'resend'
import { WeeklyBriefEmail } from '@/components/email/WeeklyBriefEmail'
import { BriefData, NicheConfig } from '@/types/niche'
import * as React from 'react'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function sendBrief(
  userEmail: string, 
  brief: BriefData, 
  niche: NicheConfig
): Promise<void> {
  if (!resend) {
    console.error('[Email] Cannot send email: RESEND_API_KEY is missing in environment variables.')
    return
  }
  try {
    const { data, error } = await resend.emails.send({
      from: 'RepsBrief <hello@repsbrief.com>',
      to: [userEmail],
      subject: `🏋️ Your RepsBrief is ready — 20 ideas for this week`,
      react: WeeklyBriefEmail({ niche, ideas: brief.ideas }) as React.ReactElement,
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
