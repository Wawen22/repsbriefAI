import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { buildTrelloAuthorizeUrl, getTrelloRequestToken } from "@/lib/integrations/trello"

const TRELLO_OAUTH_COOKIE = "rb_trello_oauth_state"
const STATE_TTL_SECONDS = 10 * 60

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

function getTrelloCallbackUrl(appBaseUrl: string) {
  return `${appBaseUrl}/api/auth/trello/callback`
}

function encodeCookieState(payload: TrelloOAuthCookieState) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

function redirectWithError(appBaseUrl: string, errorCode: string) {
  return NextResponse.redirect(`${appBaseUrl}/dashboard/settings?tab=integrations&error=${errorCode}`)
}

export async function GET(req: NextRequest) {
  const appBaseUrl = getAppBaseUrl(req)
  const callbackUrl = getTrelloCallbackUrl(appBaseUrl)
  const teamId = req.nextUrl.searchParams.get("team_id")

  if (!teamId) {
    return redirectWithError(appBaseUrl, "trello_team_missing")
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
      return redirectWithError(appBaseUrl, "trello_forbidden")
    }

    const requestTokenData = await getTrelloRequestToken(callbackUrl)
    const nonce = randomBytes(24).toString("hex")
    const cookieState = encodeCookieState({
      teamId,
      nonce,
      iat: Date.now(),
      requestToken: requestTokenData.oauthToken,
      requestTokenSecret: requestTokenData.oauthTokenSecret,
    })

    const trelloAuthUrl = buildTrelloAuthorizeUrl(requestTokenData.oauthToken)
    const response = NextResponse.redirect(trelloAuthUrl)
    response.cookies.set(TRELLO_OAUTH_COOKIE, cookieState, {
      httpOnly: true,
      secure: appBaseUrl.startsWith("https://"),
      sameSite: "lax",
      path: "/api/auth/trello/callback",
      maxAge: STATE_TTL_SECONDS,
    })
    return response
  } catch (err: unknown) {
    console.error("Trello start route error:", err)
    return redirectWithError(appBaseUrl, "trello_start_failed")
  }
}
