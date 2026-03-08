import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const GOOGLE_OAUTH_NONCE_COOKIE = "rb_google_oauth_nonce"
const STATE_TTL_SECONDS = 10 * 60

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

function encodeState(payload: GoogleOAuthState) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

function buildGoogleAuthorizeUrl(state: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error("Google OAuth env vars mancanti.")
  }

  const scopes = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
  ]

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes.join(" "),
    state,
    access_type: "offline",
    prompt: "consent",
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

function redirectWithError(appBaseUrl: string, errorCode: string) {
  return NextResponse.redirect(`${appBaseUrl}/dashboard/settings?tab=integrations&error=${errorCode}`)
}

export async function GET(req: NextRequest) {
  const appBaseUrl = getAppBaseUrl(req)
  const teamId = req.nextUrl.searchParams.get("team_id")

  if (!teamId) {
    return redirectWithError(appBaseUrl, "google_team_missing")
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
      return redirectWithError(appBaseUrl, "google_forbidden")
    }

    const nonce = randomBytes(24).toString("hex")
    const state = encodeState({
      teamId,
      nonce,
      iat: Date.now(),
    })
    const redirectUri = getGoogleRedirectUri(appBaseUrl)
    const googleAuthUrl = buildGoogleAuthorizeUrl(state, redirectUri)

    const response = NextResponse.redirect(googleAuthUrl)
    response.cookies.set(GOOGLE_OAUTH_NONCE_COOKIE, nonce, {
      httpOnly: true,
      secure: appBaseUrl.startsWith("https://"),
      sameSite: "lax",
      path: "/api/auth/google/callback",
      maxAge: STATE_TTL_SECONDS,
    })

    return response
  } catch (err: unknown) {
    console.error("Google start route error:", err)
    return redirectWithError(appBaseUrl, "google_start_failed")
  }
}
