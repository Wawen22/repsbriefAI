const CLICKUP_CLIENT_ID = process.env.CLICKUP_CLIENT_ID
const CLICKUP_CLIENT_SECRET = process.env.CLICKUP_CLIENT_SECRET

type ClickUpTokenResponse = {
  access_token?: string
  token_type?: string
  scope?: string
  error?: string
  err?: string
  message?: string
}

type ClickUpWorkspace = {
  id?: string
  name?: string
  color?: string | null
}

type ClickUpTeamsResponse = {
  teams?: ClickUpWorkspace[]
  err?: string
  message?: string
}

export function buildClickUpAuthorizeUrl(state: string, redirectUri: string) {
  if (!CLICKUP_CLIENT_ID) {
    throw new Error("ClickUp OAuth env vars mancanti.")
  }

  const params = new URLSearchParams({
    client_id: CLICKUP_CLIENT_ID,
    redirect_uri: redirectUri,
    state,
  })

  return `https://app.clickup.com/api?${params.toString()}`
}

export async function exchangeCodeForClickUpToken(code: string, redirectUri: string) {
  if (!CLICKUP_CLIENT_ID || !CLICKUP_CLIENT_SECRET) {
    throw new Error("ClickUp OAuth env vars mancanti.")
  }

  const response = await fetch("https://api.clickup.com/api/v2/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: CLICKUP_CLIENT_ID,
      client_secret: CLICKUP_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  })

  const result = (await response.json()) as ClickUpTokenResponse

  if (!response.ok || !result.access_token) {
    throw new Error(result.message || result.error || result.err || "ClickUp OAuth exchange failed")
  }

  return result
}

export async function getClickUpWorkspaces(accessToken: string) {
  async function fetchTeams(authorizationValue: string) {
    const response = await fetch("https://api.clickup.com/api/v2/team", {
      headers: {
        Authorization: authorizationValue,
        "Content-Type": "application/json",
      },
    })
    const result = (await response.json()) as ClickUpTeamsResponse
    return { response, result }
  }

  const plainAuth = await fetchTeams(accessToken)
  if (plainAuth.response.ok) {
    return plainAuth.result.teams || []
  }

  const bearerAuth = await fetchTeams(`Bearer ${accessToken}`)
  if (bearerAuth.response.ok) {
    return bearerAuth.result.teams || []
  }

  throw new Error(
    bearerAuth.result.message ||
      bearerAuth.result.err ||
      plainAuth.result.message ||
      plainAuth.result.err ||
      "Unable to load ClickUp workspaces"
  )
}
