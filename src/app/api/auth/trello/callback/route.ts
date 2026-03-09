import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  exchangeTrelloAccessToken,
  getTrelloMember,
  getTrelloWorkspaces,
} from "@/lib/integrations/trello"

const TRELLO_OAUTH_COOKIE = "rb_trello_oauth_state"
const STATE_TTL_MS = 10 * 60 * 1000

type TrelloOAuthCookieState = {
  teamId: string
  nonce: string
  iat: number
  requestToken: string
  requestTokenSecret: string
}

function getAppBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
}

function decodeCookieState(rawState: string): TrelloOAuthCookieState | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(rawState, "base64url").toString("utf8")
    ) as Partial<TrelloOAuthCookieState>

    if (
      typeof parsed.teamId !== "string" ||
      typeof parsed.nonce !== "string" ||
      typeof parsed.iat !== "number" ||
      typeof parsed.requestToken !== "string" ||
      typeof parsed.requestTokenSecret !== "string"
    ) {
      return null
    }

    return {
      teamId: parsed.teamId,
      nonce: parsed.nonce,
      iat: parsed.iat,
      requestToken: parsed.requestToken,
      requestTokenSecret: parsed.requestTokenSecret,
    }
  } catch {
    return null
  }
}

function redirectWithCleanup(appBaseUrl: string, target: string) {
  const response = NextResponse.redirect(`${appBaseUrl}${target}`)
  response.cookies.delete(TRELLO_OAUTH_COOKIE)
  return response
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const oauthToken = searchParams.get("oauth_token")
  const oauthVerifier = searchParams.get("oauth_verifier")
  const denied = searchParams.get("denied")
  const appBaseUrl = getAppBaseUrl(req)

  if (denied) {
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=trello_auth_denied")
  }

  if (!oauthToken || !oauthVerifier) {
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=trello_auth_failed")
  }

  try {
    const cookieRawState = req.cookies.get(TRELLO_OAUTH_COOKIE)?.value
    const state = cookieRawState ? decodeCookieState(cookieRawState) : null

    if (!state) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=trello_state_invalid")
    }

    if (Date.now() - state.iat > STATE_TTL_MS) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=trello_state_expired")
    }

    if (oauthToken !== state.requestToken) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=trello_state_mismatch")
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
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=trello_forbidden")
    }

    const tokenData = await exchangeTrelloAccessToken(
      oauthToken,
      oauthVerifier,
      state.requestTokenSecret
    )
    const member = await getTrelloMember(tokenData.accessToken)
    const workspaces = await getTrelloWorkspaces(tokenData.accessToken)
    const firstWorkspace = workspaces[0]

    const { error: integrationError } = await supabase
      .from("team_integrations")
      .upsert(
        {
          team_id: teamId,
          provider: "trello",
          encrypted_credentials: {
            access_token: tokenData.accessToken,
            token_secret: tokenData.accessTokenSecret,
          },
          settings: {
            member_id: member.id || null,
            member_username: member.username || null,
            member_full_name: member.fullName || null,
            member_email: member.email || null,
            workspace_id: firstWorkspace?.id || null,
            workspace_name: firstWorkspace?.displayName || firstWorkspace?.name || null,
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
      .eq("provider", "trello")
      .single()

    if (integration?.id) {
      const { error: logError } = await supabase.from("team_integration_logs").insert({
        team_id: teamId,
        integration_id: integration.id,
        provider: "trello",
        action: "auth_success",
        status: "success",
        event_type: "auth_success",
        details: {
          member_username: member.username || null,
          workspace_id: firstWorkspace?.id || null,
          workspace_name: firstWorkspace?.displayName || firstWorkspace?.name || null,
        },
      })
      if (logError) {
        console.error("Trello callback log insert failed:", logError)
      }
    }

    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&success=trello_connected")
  } catch (err: unknown) {
    console.error("Trello callback error:", err)
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=trello_setup_error")
  }
}
