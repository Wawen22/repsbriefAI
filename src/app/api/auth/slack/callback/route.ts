import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { exchangeCodeForSlackToken } from "@/lib/integrations/slack"

const DEFAULT_EVENTS = ["idea.approved", "brief.ready", "content.scheduled"]

function getAppBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state") // teamId
  const error = searchParams.get("error")
  const appBaseUrl = getAppBaseUrl(req)

  if (error || !code || !state) {
    console.error("Slack OAuth error:", error)
    return NextResponse.redirect(`${appBaseUrl}/dashboard/settings?tab=integrations&error=slack_auth_failed`)
  }

  try {
    const supabase = await createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      return NextResponse.redirect(`${appBaseUrl}/login`)
    }

    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", state)
      .eq("user_id", auth.user.id)
      .maybeSingle()

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.redirect(`${appBaseUrl}/dashboard/settings?tab=integrations&error=slack_forbidden`)
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
      access_token: tokenData.access_token || null,
      bot_user_id: tokenData.bot_user_id || null,
      scope: tokenData.scope || null,
      app_id: tokenData.app_id || null,
    }

    const { error: integrationError } = await supabase
      .from("team_integrations")
      .upsert(
        {
          team_id: state,
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
      .eq("team_id", state)
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
          team_id: state,
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
      .eq("team_id", state)
      .eq("provider", "slack")
      .single()

    if (integration?.id) {
      await supabase.from("team_integration_logs").insert({
        team_id: state,
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

    return NextResponse.redirect(`${appBaseUrl}/dashboard/settings?tab=integrations&success=slack_connected`)
  } catch (err: unknown) {
    console.error("Slack callback error:", err)
    return NextResponse.redirect(`${appBaseUrl}/dashboard/settings?tab=integrations&error=slack_setup_error`)
  }
}
