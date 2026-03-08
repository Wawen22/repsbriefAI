import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const DISCORD_OAUTH_NONCE_COOKIE = "rb_discord_oauth_nonce"
const STATE_TTL_SECONDS = 10 * 60

type DiscordOAuthState = {
  teamId: string
  nonce: string
  iat: number
}

function getAppBaseUrl(req: NextRequest) {
  return process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
}

function encodeState(payload: DiscordOAuthState) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url")
}

function getDiscordRedirectUri(appBaseUrl: string) {
  return `${appBaseUrl}/api/auth/discord/callback`
}

function buildDiscordAuthorizeUrl(state: string, redirectUri: string) {
  const clientId = process.env.DISCORD_CLIENT_ID
  if (!clientId) {
    throw new Error("Discord OAuth env vars mancanti.")
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "identify guilds webhook.incoming",
    redirect_uri: redirectUri,
    prompt: "consent",
    state,
  })

  return `https://discord.com/oauth2/authorize?${params.toString()}`
}

function redirectWithError(appBaseUrl: string, errorCode: string) {
  return NextResponse.redirect(`${appBaseUrl}/dashboard/settings?tab=integrations&error=${errorCode}`)
}

export async function GET(req: NextRequest) {
  const appBaseUrl = getAppBaseUrl(req)
  const teamId = req.nextUrl.searchParams.get("team_id")

  if (!teamId) {
    return redirectWithError(appBaseUrl, "discord_team_missing")
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
      return redirectWithError(appBaseUrl, "discord_forbidden")
    }

    const nonce = randomBytes(24).toString("hex")
    const state = encodeState({
      teamId,
      nonce,
      iat: Date.now(),
    })

    const redirectUri = getDiscordRedirectUri(appBaseUrl)
    const discordAuthUrl = buildDiscordAuthorizeUrl(state, redirectUri)
    const response = NextResponse.redirect(discordAuthUrl)

    response.cookies.set(DISCORD_OAUTH_NONCE_COOKIE, nonce, {
      httpOnly: true,
      secure: appBaseUrl.startsWith("https://"),
      sameSite: "lax",
      path: "/api/auth/discord/callback",
      maxAge: STATE_TTL_SECONDS,
    })

    return response
  } catch (err: unknown) {
    console.error("Discord start route error:", err)
    return redirectWithError(appBaseUrl, "discord_start_failed")
  }
}
