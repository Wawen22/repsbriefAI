"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getTrelloMember, getTrelloWorkspaces } from "@/lib/integrations/trello"

type TeamRole = "owner" | "admin" | "member"

async function ensureTeamAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teamId: string,
  userId: string
) {
  const { data: membership } = await supabase
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .maybeSingle()

  const role = membership?.role as TeamRole | undefined
  return role === "owner" || role === "admin"
}

export async function testTrelloIntegrationAction(teamId: string) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { success: false, error: "Unauthorized" }

  const canManage = await ensureTeamAdmin(supabase, teamId, auth.user.id)
  if (!canManage) return { success: false, error: "Solo owner/admin possono testare integrazioni" }

  const { data: integration, error: integrationError } = await supabase
    .from("team_integrations")
    .select("id, encrypted_credentials")
    .eq("team_id", teamId)
    .eq("provider", "trello")
    .maybeSingle()

  if (integrationError) return { success: false, error: integrationError.message }
  if (!integration?.id) return { success: false, error: "Integrazione Trello non trovata" }

  const creds =
    typeof integration.encrypted_credentials === "object" && integration.encrypted_credentials !== null
      ? (integration.encrypted_credentials as Record<string, unknown>)
      : null

  const accessToken = typeof creds?.access_token === "string" ? creds.access_token : null
  if (!accessToken) return { success: false, error: "Token Trello non disponibile, riconnetti l'account" }

  try {
    const member = await getTrelloMember(accessToken)
    const workspaces = await getTrelloWorkspaces(accessToken)

    await supabase.from("team_integration_logs").insert({
      team_id: teamId,
      integration_id: integration.id,
      provider: "trello",
      action: "test_send",
      status: "success",
      event_type: "test_send",
      details: {
        member_username: member.username || null,
        member_id: member.id || null,
        workspaces_count: workspaces.length,
      },
    })

    return { success: true, workspaceCount: workspaces.length }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Trello test failed"

    await supabase.from("team_integration_logs").insert({
      team_id: teamId,
      integration_id: integration.id,
      provider: "trello",
      action: "test_send",
      status: "error",
      event_type: "test_send",
      details: {
        error: message,
      },
    })

    return { success: false, error: message }
  }
}

export async function disconnectTrelloIntegrationAction(teamId: string) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) return { success: false, error: "Unauthorized" }

  const canManage = await ensureTeamAdmin(supabase, teamId, auth.user.id)
  if (!canManage) return { success: false, error: "Solo owner/admin possono disconnettere integrazioni" }

  const { data: integration, error: integrationLookupError } = await supabase
    .from("team_integrations")
    .select("id")
    .eq("team_id", teamId)
    .eq("provider", "trello")
    .maybeSingle()

  if (integrationLookupError) return { success: false, error: integrationLookupError.message }
  if (!integration?.id) return { success: false, error: "Integrazione Trello non trovata" }

  const { error: updateError } = await supabase
    .from("team_integrations")
    .update({
      encrypted_credentials: {},
      settings: {},
      status: "expired",
    })
    .eq("id", integration.id)

  if (updateError) return { success: false, error: updateError.message }

  await supabase.from("team_integration_logs").insert({
    team_id: teamId,
    integration_id: integration.id,
    provider: "trello",
    action: "disconnect",
    status: "success",
    event_type: "disconnect",
    details: {},
  })

  revalidatePath("/dashboard/settings")
  return { success: true }
}
