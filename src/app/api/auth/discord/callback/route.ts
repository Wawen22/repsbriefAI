import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildDiscordWebhookUrl, exchangeCodeForDiscordToken } from "@/lib/integrations/discord"

const DEFAULT_EVENTS = ["idea.approved", "brief.ready", "content.scheduled"]
const DISCORD_OAUTH_NONCE_COOKIE = "rb_discord_oauth_nonce"
const STATE_TTL_MS = 10 * 60 * 1000

type DiscordOAuthState = {
  teamId: string
  nonce: string
  iat: number
}

function getAppBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
}

function getDiscordRedirectUri(appBaseUrl: string) {
  return `${appBaseUrl}/api/auth/discord/callback`
}

function decodeState(rawState: string): DiscordOAuthState | null {
  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8")) as Partial<DiscordOAuthState>
    if (
      typeof parsed.teamId !== "string" ||
      typeof parsed.nonce !== "string" ||
      typeof parsed.iat !== "number"
    ) {
      return null
    }

    return {
      teamId: parsed.teamId,
      nonce: parsed.nonce,
      iat: parsed.iat,
    }
  } catch {
    return null
  }
}

function redirectWithCleanup(appBaseUrl: string, target: string) {
  const response = NextResponse.redirect(`${appBaseUrl}${target}`)
  response.cookies.delete(DISCORD_OAUTH_NONCE_COOKIE)
  return response
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const rawState = searchParams.get("state")
  const error = searchParams.get("error")
  const appBaseUrl = getAppBaseUrl(req)
  const redirectUri = getDiscordRedirectUri(appBaseUrl)

  if (error || !code || !rawState) {
    console.error("Discord OAuth error:", error)
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=discord_auth_failed")
  }

  try {
    const state = decodeState(rawState)
    const expectedNonce = req.cookies.get(DISCORD_OAUTH_NONCE_COOKIE)?.value

    if (!state || !expectedNonce) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=discord_state_invalid")
    }

    if (state.nonce !== expectedNonce) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=discord_state_mismatch")
    }

    if (Date.now() - state.iat > STATE_TTL_MS) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=discord_state_expired")
    }

    const teamId = state.teamId
    const supabase = await createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      return redirectWithCleanup(appBaseUrl, "/login")
    }

    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", auth.user.id)
      .maybeSingle()

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=discord_forbidden")
    }

    const tokenData = await exchangeCodeForDiscordToken(code, redirectUri)
    const incomingWebhookUrl = buildDiscordWebhookUrl(tokenData.webhook)

    if (!incomingWebhookUrl) {
      throw new Error("Missing incoming webhook URL from Discord OAuth")
    }

    const discordChannelName = tokenData.webhook?.name || "Discord Notifications"
    const integrationSettings = {
      guild_id: tokenData.webhook?.guild_id || null,
      channel_id: tokenData.webhook?.channel_id || null,
      webhook_id: tokenData.webhook?.id || null,
      webhook_name: tokenData.webhook?.name || null,
      webhook_type: tokenData.webhook?.type || null,
      webhook_application_id: tokenData.webhook?.application_id || null,
    }

    const credentials = {
      access_token: tokenData.access_token || null,
      refresh_token: tokenData.refresh_token || null,
      token_type: tokenData.token_type || null,
      expires_in: tokenData.expires_in || null,
      scope: tokenData.scope || null,
      webhook_token: tokenData.webhook?.token || null,
    }

    const { error: integrationError } = await supabase
      .from("team_integrations")
      .upsert(
        {
          team_id: teamId,
          provider: "discord",
          encrypted_credentials: credentials,
          settings: integrationSettings,
          status: "active",
        },
        { onConflict: "team_id,provider" }
      )

    if (integrationError) throw integrationError

    const { data: existingWebhook } = await supabase
      .from("team_webhooks")
      .select("id")
      .eq("team_id", teamId)
      .eq("channel", "discord")
      .eq("url", incomingWebhookUrl)
      .maybeSingle()

    if (existingWebhook?.id) {
      const { error: updateError } = await supabase
        .from("team_webhooks")
        .update({
          name: discordChannelName,
          active: true,
          events: DEFAULT_EVENTS,
        })
        .eq("id", existingWebhook.id)

      if (updateError) throw updateError
    } else {
      const { error: insertError } = await supabase
        .from("team_webhooks")
        .insert({
          team_id: teamId,
          url: incomingWebhookUrl,
          name: discordChannelName,
          events: DEFAULT_EVENTS,
          channel: "discord",
          active: true,
        })

      if (insertError) throw insertError
    }

    const { data: integration } = await supabase
      .from("team_integrations")
      .select("id")
      .eq("team_id", teamId)
      .eq("provider", "discord")
      .single()

    if (integration?.id) {
      await supabase.from("team_integration_logs").insert({
        team_id: teamId,
        integration_id: integration.id,
        provider: "discord",
        action: "auth_success",
        status: "success",
        event_type: "auth_success",
        details: {
          channel_name: integrationSettings.webhook_name,
          channel_id: integrationSettings.channel_id,
          guild_id: integrationSettings.guild_id,
          webhook_id: integrationSettings.webhook_id,
        },
      })
    }

    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&success=discord_connected")
  } catch (err: unknown) {
    console.error("Discord callback error:", err)
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=discord_setup_error")
  }
}
