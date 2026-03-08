const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET

type DiscordOAuthWebhook = {
  id?: string
  type?: number
  name?: string
  channel_id?: string
  guild_id?: string
  token?: string
  url?: string
  application_id?: string
}

type DiscordOAuthResponse = {
  access_token?: string
  token_type?: string
  expires_in?: number
  refresh_token?: string
  scope?: string
  webhook?: DiscordOAuthWebhook
  error?: string
  error_description?: string
}

export function buildDiscordWebhookUrl(webhook: DiscordOAuthWebhook | undefined): string | null {
  if (!webhook) return null
  if (typeof webhook.url === "string" && webhook.url.length > 0) return webhook.url
  if (typeof webhook.id === "string" && typeof webhook.token === "string") {
    return `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`
  }
  return null
}

export async function exchangeCodeForDiscordToken(code: string, redirectUri: string) {
  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
    throw new Error("Discord OAuth env vars mancanti.")
  }

  const body = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  })

  const response = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  const result = (await response.json()) as DiscordOAuthResponse

  if (!response.ok || !result.access_token) {
    throw new Error(result.error_description || result.error || "Discord OAuth exchange failed")
  }

  return result
}
