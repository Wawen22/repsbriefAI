import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, findFirstAvailableParent } from "@/lib/integrations/notion"
import { createClient } from "@/lib/supabase/server"

const NOTION_OAUTH_NONCE_COOKIE = "rb_notion_oauth_nonce"
const STATE_TTL_MS = 10 * 60 * 1000

type NotionOAuthState = {
  teamId: string
  nonce: string
  iat: number
}

function getAppBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
}

function getNotionRedirectUri(appBaseUrl: string) {
  return `${appBaseUrl}/api/auth/notion/callback`
}

function decodeState(rawState: string): NotionOAuthState | null {
  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8")) as Partial<NotionOAuthState>
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
  response.cookies.delete(NOTION_OAUTH_NONCE_COOKIE)
  return response
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const rawState = searchParams.get("state")
  const error = searchParams.get("error")
  const appBaseUrl = getAppBaseUrl(req)
  const redirectUri = getNotionRedirectUri(appBaseUrl)

  if (error || !code || !rawState) {
    console.error("Notion OAuth error:", error)
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=notion_auth_failed")
  }

  try {
    const state = decodeState(rawState)
    const expectedNonce = req.cookies.get(NOTION_OAUTH_NONCE_COOKIE)?.value

    if (!state || !expectedNonce) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=notion_state_invalid")
    }

    if (state.nonce !== expectedNonce) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=notion_state_mismatch")
    }

    if (Date.now() - state.iat > STATE_TTL_MS) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=notion_state_expired")
    }

    const supabase = await createClient()
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      return redirectWithCleanup(appBaseUrl, "/login")
    }

    const teamId = state.teamId
    const { data: membership } = await supabase
      .from("team_members")
      .select("role")
      .eq("team_id", teamId)
      .eq("user_id", auth.user.id)
      .maybeSingle()

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=notion_forbidden")
    }

    const tokenData = await exchangeCodeForToken(code, redirectUri)
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const { access_token, workspace_id, workspace_name, workspace_icon } = tokenData
    const firstAvailable = await findFirstAvailableParent(access_token)
    const dataSourceId = firstAvailable?.type === "data_source_id" ? firstAvailable.id : null

    const { error: dbError } = await supabase
      .from("team_integrations")
      .upsert(
        {
          team_id: teamId,
          provider: "notion",
          encrypted_credentials: {
            access_token,
            workspace_id,
            workspace_name,
            workspace_icon,
          },
          settings: {
            data_source_id: dataSourceId,
            workspace_name,
          },
          status: "active",
        },
        { onConflict: "team_id,provider" }
      )

    if (dbError) throw dbError

    const { data: integration } = await supabase
      .from("team_integrations")
      .select("id")
      .eq("team_id", teamId)
      .eq("provider", "notion")
      .single()

    if (integration?.id) {
      const { error: logError } = await supabase.from("team_integration_logs").insert({
        team_id: teamId,
        integration_id: integration.id,
        provider: "notion",
        action: "auth_success",
        status: "success",
        event_type: "auth_success",
        details: { workspace_name },
      })
      if (logError) {
        console.error("Notion callback log insert failed:", logError)
      }
    }

    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&success=notion_connected")
  } catch (err: unknown) {
    console.error("Error in Notion callback:", err)
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=notion_setup_error")
  }
}
