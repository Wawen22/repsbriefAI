import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens } from "@/lib/integrations/google"
import { createClient } from "@/lib/supabase/server"

const GOOGLE_OAUTH_NONCE_COOKIE = "rb_google_oauth_nonce"
const STATE_TTL_MS = 10 * 60 * 1000

type GoogleOAuthState = {
  teamId: string
  nonce: string
  iat: number
}

function getAppBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
}

function getGoogleRedirectUri(appBaseUrl: string) {
  return `${appBaseUrl}/api/auth/google/callback`
}

function decodeState(rawState: string): GoogleOAuthState | null {
  try {
    const parsed = JSON.parse(Buffer.from(rawState, "base64url").toString("utf8")) as Partial<GoogleOAuthState>
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
  response.cookies.delete(GOOGLE_OAUTH_NONCE_COOKIE)
  return response
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const rawState = searchParams.get("state")
  const error = searchParams.get("error")
  const appBaseUrl = getAppBaseUrl(req)
  const redirectUri = getGoogleRedirectUri(appBaseUrl)

  if (error || !code || !rawState) {
    console.error("Google OAuth error:", error)
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=google_auth_failed")
  }

  try {
    const state = decodeState(rawState)
    const expectedNonce = req.cookies.get(GOOGLE_OAUTH_NONCE_COOKIE)?.value

    if (!state || !expectedNonce) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=google_state_invalid")
    }

    if (state.nonce !== expectedNonce) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=google_state_mismatch")
    }

    if (Date.now() - state.iat > STATE_TTL_MS) {
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=google_state_expired")
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
      return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=google_forbidden")
    }

    const tokenData = await exchangeCodeForTokens(code, redirectUri)
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const { access_token, refresh_token, expires_in, id_token } = tokenData
    const expiryDate = Date.now() + expires_in * 1000

    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    const userInfo = await userInfoResponse.json()

    const { error: dbError } = await supabase
      .from("team_integrations")
      .upsert(
        {
          team_id: teamId,
          provider: "google_calendar",
          encrypted_credentials: {
            access_token,
            refresh_token,
            expiry_date: expiryDate,
            id_token,
          },
          settings: {
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            calendar_id: "primary",
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
      .eq("provider", "google_calendar")
      .single()

    if (integration?.id) {
      const { error: logError } = await supabase.from("team_integration_logs").insert({
        team_id: teamId,
        integration_id: integration.id,
        provider: "google_calendar",
        action: "auth_success",
        status: "success",
        event_type: "auth_success",
        details: { email: userInfo.email, name: userInfo.name },
      })
      if (logError) {
        console.error("Google callback log insert failed:", logError)
      }
    }

    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&success=google_connected")
  } catch (err: unknown) {
    console.error("Google Callback Error:", err)
    return redirectWithCleanup(appBaseUrl, "/dashboard/settings?tab=integrations&error=google_setup_error")
  }
}
