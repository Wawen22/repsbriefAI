import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const SLACK_OAUTH_NONCE_COOKIE = "rb_slack_oauth_nonce"
const STATE_TTL_SECONDS = 10 * 60

type SlackOAuthState = {
  teamId: string
  nonce: string
  iat: number
}

function getAppBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
}

function encodeState(payload: SlackOAuthState) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

function buildSlackAuthorizeUrl(state: string) {
  const clientId = process.env.SLACK_CLIENT_ID
  if (!clientId) {
    throw new Error("Slack OAuth env vars mancanti.")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "incoming-webhook",
    state,
  })

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`
}

function redirectWithError(appBaseUrl: string, errorCode: string) {
  return NextResponse.redirect(`${appBaseUrl}/dashboard/settings?tab=integrations&error=${errorCode}`)
}

export async function GET(req: NextRequest) {
  const appBaseUrl = getAppBaseUrl(req)
  const teamId = req.nextUrl.searchParams.get("team_id")

  if (!teamId) {
    return redirectWithError(appBaseUrl, "slack_team_missing")
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
      return redirectWithError(appBaseUrl, "slack_forbidden")
    }

    const nonce = randomBytes(24).toString("hex")
    const state = encodeState({
      teamId,
      nonce,
      iat: Date.now(),
    })

    const slackAuthUrl = buildSlackAuthorizeUrl(state)
    const response = NextResponse.redirect(slackAuthUrl)
    response.cookies.set(SLACK_OAUTH_NONCE_COOKIE, nonce, {
      httpOnly: true,
      secure: appBaseUrl.startsWith("https://"),
      sameSite: "lax",
      path: "/api/auth/slack/callback",
      maxAge: STATE_TTL_SECONDS,
    })
    return response
  } catch (err: unknown) {
    console.error("Slack start route error:", err)
    return redirectWithError(appBaseUrl, "slack_start_failed")
  }
}
