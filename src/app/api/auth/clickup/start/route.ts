import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildClickUpAuthorizeUrl } from "@/lib/integrations/clickup"

const CLICKUP_OAUTH_NONCE_COOKIE = "rb_clickup_oauth_nonce"
const STATE_TTL_SECONDS = 10 * 60

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

function encodeState(payload: ClickUpOAuthState) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

function redirectWithError(appBaseUrl: string, errorCode: string) {
  return NextResponse.redirect(`${appBaseUrl}/dashboard/settings?tab=integrations&error=${errorCode}`)
}

export async function GET(req: NextRequest) {
  const appBaseUrl = getAppBaseUrl(req)
  const redirectUri = getClickUpRedirectUri(appBaseUrl)
  const teamId = req.nextUrl.searchParams.get("team_id")

  if (!teamId) {
    return redirectWithError(appBaseUrl, "clickup_team_missing")
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
      .eq("team_id", teamId)
      .eq("user_id", auth.user.id)
      .maybeSingle()

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return redirectWithError(appBaseUrl, "clickup_forbidden")
    }

    const nonce = randomBytes(24).toString("hex")
    const state = encodeState({
      teamId,
      nonce,
      iat: Date.now(),
    })

    const clickUpAuthUrl = buildClickUpAuthorizeUrl(state, redirectUri)
    const response = NextResponse.redirect(clickUpAuthUrl)
    response.cookies.set(CLICKUP_OAUTH_NONCE_COOKIE, nonce, {
      httpOnly: true,
      secure: appBaseUrl.startsWith("https://"),
      sameSite: "lax",
      path: "/api/auth/clickup/callback",
      maxAge: STATE_TTL_SECONDS,
    })
    return response
  } catch (err: unknown) {
    console.error("ClickUp start route error:", err)
    return redirectWithError(appBaseUrl, "clickup_start_failed")
  }
}
