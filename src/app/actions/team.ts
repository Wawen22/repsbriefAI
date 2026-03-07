'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function switchTeamAction(teamId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: membership } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return { error: 'You do not have access to this team' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ current_team_id: teamId })
    .eq('id', user.id)

  if (error) {
    console.error('Failed to switch team:', error)
    return { error: 'Failed to switch team' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function getUserTeamsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { teams: [], currentTeamId: null, plan: 'starter' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_team_id, plan')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('team_members')
    .select('team_id, role, teams(id, name, owner_id, logo_url, primary_color)')
    .eq('user_id', user.id)

  const teams =
    memberships
      ?.map((membership) => {
        const rawTeam = Array.isArray(membership.teams) ? membership.teams[0] : membership.teams
        if (!rawTeam) return null

        return {
          id: rawTeam.id,
          name: rawTeam.name,
          owner_id: rawTeam.owner_id,
          logo_url: rawTeam.logo_url,
          primary_color: rawTeam.primary_color,
          role: membership.role,
        }
      })
      .filter((team): team is NonNullable<typeof team> => Boolean(team)) || []

  return {
    teams,
    currentTeamId: profile?.current_team_id,
    plan: profile?.plan || 'starter'
  }
}

export async function createTeamInvitationAction(email: string, role: string = 'member') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_team_id, plan')
    .eq('id', user.id)
    .single()

  if (!profile?.current_team_id) return { error: 'No active workspace' }
  if (profile.plan !== 'team') return { error: 'Upgrade to Team Plan to invite members' }

  const { data: team } = await supabase
    .from('teams')
    .select('name')
    .eq('id', profile.current_team_id)
    .single()

  const { data: invite, error } = await supabase
    .from('team_invitations')
    .insert({
      team_id: profile.current_team_id,
      email: email.toLowerCase().trim(),
      invited_by: user.id,
      role: role
    })
    .select('token')
    .single()

  if (error) {
    console.error('Failed to create invite:', error)
    return { error: 'Failed to generate invitation' }
  }

  // Send Email via Resend
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/join/${invite.token}`
  
  try {
    await resend.emails.send({
      from: 'RepsBrief <onboarding@resend.dev>',
      to: [email],
      subject: `You've been invited to join ${team?.name} on RepsBrief`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Workspace Invitation</h2>
          <p>Hi there,</p>
          <p><strong>${user.email}</strong> has invited you to collaborate on the <strong>${team?.name}</strong> workspace on RepsBrief.</p>
          <p>Click the button below to accept the invitation and start creating strategies together:</p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">Accept Invitation</a>
          </div>
          <p style="color: #666; font-size: 12px;">This link will expire in 7 days.</p>
        </div>
      `
    })
  } catch (err) {
    console.error('Failed to send invite email:', err)
    // We don't return error here because the invite is already in DB, 
    // the user could technically still use the link if we provide it in UI
  }

  return { success: true, inviteLink }
}

export async function acceptInvitationAction(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Please login first' }

  // 1. Get invite
  const { data: invite, error: fetchErr } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (fetchErr || !invite) return { error: 'Invitation not found or already used' }
  if (new Date(invite.expires_at) < new Date()) return { error: 'Invitation expired' }

  // 2. Add member
  const { error: joinErr } = await supabase
    .from('team_members')
    .insert({
      team_id: invite.team_id,
      user_id: user.id,
      role: invite.role
    })

  if (joinErr) {
    if (joinErr.code === '23505') return { error: 'You are already a member of this team' }
    return { error: 'Failed to join team' }
  }

  // 3. Mark invite as accepted
  await supabase
    .from('team_invitations')
    .update({ status: 'accepted' })
    .eq('id', invite.id)

  // 4. Update current profile team
  await supabase
    .from('profiles')
    .update({ current_team_id: invite.team_id })
    .eq('id', user.id)

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateTeamBrandingAction(logoUrl?: string, primaryColor?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_team_id, plan')
    .eq('id', user.id)
    .single()

  if (!profile?.current_team_id) return { error: 'No active workspace' }
  if (profile.plan !== 'team') return { error: 'Upgrade to Team Plan for white-labeling' }

  // 1. Verify admin/owner role
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', profile.current_team_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['admin', 'owner'].includes(membership.role)) {
    return { error: 'Only admins or owners can update branding' }
  }

  // 2. Update team
  const updateData: any = {}
  if (logoUrl !== undefined) updateData.logo_url = logoUrl
  if (primaryColor !== undefined) updateData.primary_color = primaryColor

  const { error } = await supabase
    .from('teams')
    .update(updateData)
    .eq('id', profile.current_team_id)

  if (error) {
    console.error('Database Error in updateTeamBrandingAction:', error)
    return { error: `Failed to update: ${error.message}` }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
