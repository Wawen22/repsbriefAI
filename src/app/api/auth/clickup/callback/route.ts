import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  exchangeCodeForClickUpToken,
  getClickUpWorkspaces,
  readClickUpAccessToken,
} from "@/lib/integrations/clickup"

const CLICKUP_OAUTH_NONCE_COOKIE = "rb_clickup_oauth_nonce"
const STATE_TTL_MS = 10 * 60 * 1000

type ClickUpOAuthState = {
  teamId: string
  nonce: string
  iat: number
}

function getAppBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
}

function getClickUpRedirectUri(appBaseUrl: string) {
  return `${appBaseUrl}/api/auth/clickup/callback`
}

function decodeState(rawState: string): ClickUpOAuthState | null {
  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8")) as Partial<ClickUpOAuthState>
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
  response.cookies.delete(CLICKUP_OAUTH_NONCE_COOKIE)
  return response
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const rawState = searchParams.get("state")
  const error = searchParams.get("error")
  const appBaseUrl = getAppBaseUrl(req)
  const redirectUri = getClickUpRedirectUri(appBaseUrl)

  if (error || !code || !rawState) {
    console.error("ClickUp OAuth error:", error)
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=clickup_auth_failed")
  }

  try {
    const state = decodeState(rawState)
    const expectedNonce = req.cookies.get(CLICKUP_OAUTH_NONCE_COOKIE)?.value

    if (!state || !expectedNonce) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=clickup_state_invalid")
    }

    if (state.nonce !== expectedNonce) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=clickup_state_mismatch")
    }

    if (Date.now() - state.iat > STATE_TTL_MS) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=clickup_state_expired")
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
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=clickup_forbidden")
    }

    const tokenData = await exchangeCodeForClickUpToken(code, redirectUri)
    const accessToken = readClickUpAccessToken(tokenData)
    if (!accessToken) {
      throw new Error("ClickUp OAuth token missing in exchange response")
    }
    const workspaces = await getClickUpWorkspaces(accessToken)
    const firstWorkspace = workspaces[0]

    const { error: integrationError } = await supabase
      .from("team_integrations")
      .upsert(
        {
          team_id: teamId,
          provider: "clickup",
          encrypted_credentials: {
            access_token: accessToken,
            token_type: tokenData.token_type || null,
            scope: tokenData.scope || null,
          },
          settings: {
            workspace_id: firstWorkspace?.id || null,
            workspace_name: firstWorkspace?.name || null,
          },
          status: "active",
        },
        { onConflict: "team_id,provider" }
      )

    if (integrationError) throw integrationError

    const { data: integration } = await supabase
      .from("team_integrations")
      .select("id")
      .eq("team_id", teamId)
      .eq("provider", "clickup")
      .single()

    if (integration?.id) {
      const { error: logError } = await supabase.from("team_integration_logs").insert({
        team_id: teamId,
        integration_id: integration.id,
        provider: "clickup",
        action: "auth_success",
        status: "success",
        event_type: "auth_success",
        details: {
          workspace_id: firstWorkspace?.id || null,
          workspace_name: firstWorkspace?.name || null,
        },
      })
      if (logError) {
        console.error("ClickUp callback log insert failed:", logError)
      }
    }

    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&success=clickup_connected")
  } catch (err: unknown) {
    console.error("ClickUp callback error:", err)
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=clickup_setup_error")
  }
}
