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
