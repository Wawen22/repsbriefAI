import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { exchangeCodeForSlackToken } from "@/lib/integrations/slack"

const DEFAULT_EVENTS = ["idea.approved", "brief.ready", "content.scheduled"]
const SLACK_OAUTH_NONCE_COOKIE = "rb_slack_oauth_nonce"
const STATE_TTL_MS = 10 * 60 * 1000

type SlackOAuthState = {
  teamId: string
  nonce: string
  iat: number
}

function getAppBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
}

function decodeState(rawState: string): SlackOAuthState | null {
  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8")) as Partial<SlackOAuthState>
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
  response.cookies.delete(SLACK_OAUTH_NONCE_COOKIE)
  return response
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const rawState = searchParams.get("state")
  const error = searchParams.get("error")
  const appBaseUrl = getAppBaseUrl(req)

  if (error || !code || !rawState) {
    console.error("Slack OAuth error:", error)
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=slack_auth_failed")
  }

  try {
    const state = decodeState(rawState)
    const expectedNonce = req.cookies.get(SLACK_OAUTH_NONCE_COOKIE)?.value

    if (!state || !expectedNonce) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=slack_state_invalid")
    }

    if (state.nonce !== expectedNonce) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=slack_state_mismatch")
    }

    if (Date.now() - state.iat > STATE_TTL_MS) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=slack_state_expired")
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
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=slack_forbidden")
    }

    const tokenData = await exchangeCodeForSlackToken(code)

    const incomingWebhookUrl = tokenData.incoming_webhook?.url
    if (!incomingWebhookUrl) {
      throw new Error("Missing incoming webhook URL from Slack OAuth")
    }

    const slackChannelName = tokenData.incoming_webhook?.channel || "Slack Notifications"
    const integrationSettings = {
      team_name: tokenData.team?.name || null,
      team_id: tokenData.team?.id || null,
      channel_name: tokenData.incoming_webhook?.channel || null,
      channel_id: tokenData.incoming_webhook?.channel_id || null,
      configuration_url: tokenData.incoming_webhook?.configuration_url || null,
    }

    const credentials = {
      bot_user_id: tokenData.bot_user_id || null,
      scope: tokenData.scope || null,
      app_id: tokenData.app_id || null,
    }

    const { error: integrationError } = await supabase
      .from("team_integrations")
      .upsert(
        {
          team_id: teamId,
          provider: "slack",
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
      .eq("channel", "slack")
      .eq("url", incomingWebhookUrl)
      .maybeSingle()

    if (existingWebhook?.id) {
      const { error: updateError } = await supabase
        .from("team_webhooks")
        .update({
          name: slackChannelName,
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
          name: slackChannelName,
          events: DEFAULT_EVENTS,
          channel: "slack",
          active: true,
        })

      if (insertError) throw insertError
    }

    const { data: integration } = await supabase
      .from("team_integrations")
      .select("id")
      .eq("team_id", teamId)
      .eq("provider", "slack")
      .single()

    if (integration?.id) {
      await supabase.from("team_integration_logs").insert({
        team_id: teamId,
        integration_id: integration.id,
        provider: "slack",
        action: "auth_success",
        status: "success",
        event_type: "auth_success",
        details: {
          channel_name: integrationSettings.channel_name,
          channel_id: integrationSettings.channel_id,
          team_name: integrationSettings.team_name,
        },
      })
    }

    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&success=slack_connected")
  } catch (err: unknown) {
    console.error("Slack callback error:", err)
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=slack_setup_error")
  }
}
