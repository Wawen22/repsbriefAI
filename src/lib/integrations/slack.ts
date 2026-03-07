const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET

type SlackOAuthResponse = {
  ok: boolean
  error?: string
  access_token?: string
  scope?: string
  bot_user_id?: string
  app_id?: string
  team?: {
    id: string
    name: string
  }
  incoming_webhook?: {
    channel?: string
    channel_id?: string
    configuration_url?: string
    url?: string
  }
}

export function getSlackRedirectUri(baseUrl: string) {
  return `${baseUrl}/api/auth/slack/callback`
}

export async function exchangeCodeForSlackToken(code: string, redirectUri?: string) {
  if (!SLACK_CLIENT_ID || !SLACK_CLIENT_SECRET) {
    throw new Error("Slack OAuth env vars mancanti.")
  }

  const body = new URLSearchParams({
    code,
    client_id: SLACK_CLIENT_ID,
    client_secret: SLACK_CLIENT_SECRET,
  })

  if (redirectUri) {
    body.set("redirect_uri", redirectUri)
  }

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  const result = (await response.json()) as SlackOAuthResponse
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Slack OAuth exchange failed")
  }

  return result
}
