import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const NOTION_OAUTH_NONCE_COOKIE = "rb_notion_oauth_nonce"
const STATE_TTL_SECONDS = 10 * 60

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

function encodeState(payload: NotionOAuthState) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

function buildNotionAuthorizeUrl(state: string, redirectUri: string) {
  const clientId = process.env.NOTION_CLIENT_ID
  if (!clientId) {
    throw new Error("Notion OAuth env vars mancanti.")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    owner: "user",
    redirect_uri: redirectUri,
    state,
  })

  return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`
}

function redirectWithError(appBaseUrl: string, errorCode: string) {
  return NextResponse.redirect(`${appBaseUrl}/dashboard/settings?tab=integrations&error=${errorCode}`)
}

export async function GET(req: NextRequest) {
  const appBaseUrl = getAppBaseUrl(req)
  const teamId = req.nextUrl.searchParams.get("team_id")

  if (!teamId) {
    return redirectWithError(appBaseUrl, "notion_team_missing")
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
      return redirectWithError(appBaseUrl, "notion_forbidden")
    }

    const nonce = randomBytes(24).toString("hex")
    const state = encodeState({
      teamId,
      nonce,
      iat: Date.now(),
    })
    const redirectUri = getNotionRedirectUri(appBaseUrl)
    const notionAuthUrl = buildNotionAuthorizeUrl(state, redirectUri)

    const response = NextResponse.redirect(notionAuthUrl)
    response.cookies.set(NOTION_OAUTH_NONCE_COOKIE, nonce, {
      httpOnly: true,
      secure: appBaseUrl.startsWith("https://"),
      sameSite: "lax",
      path: "/api/auth/notion/callback",
      maxAge: STATE_TTL_SECONDS,
    })
    return response
  } catch (err: unknown) {
    console.error("Notion start route error:", err)
    return redirectWithError(appBaseUrl, "notion_start_failed")
  }
}
