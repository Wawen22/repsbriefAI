const CLICKUP_CLIENT_ID = process.env.CLICKUP_CLIENT_ID
const CLICKUP_CLIENT_SECRET = process.env.CLICKUP_CLIENT_SECRET

type ClickUpTokenResponse = {
  access_token?: string
  token?: string
  oauth_token?: string
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

  const accessToken = readClickUpAccessToken(result)

  if (!response.ok || !accessToken) {
    throw new Error(result.message || result.error || result.err || "ClickUp OAuth exchange failed")
  }

  return result
}

export function readClickUpAccessToken(result: ClickUpTokenResponse): string | null {
  const tokenCandidate = result.access_token || result.token || result.oauth_token
  if (!tokenCandidate || typeof tokenCandidate !== "string") return null
  return tokenCandidate.replace(/^Bearer\s+/i, "").trim()
}

export async function getClickUpWorkspaces(accessToken: string) {
  const normalizedToken = accessToken.replace(/^Bearer\s+/i, "").trim()
  const authCandidates = Array.from(
    new Set([
      normalizedToken,
      `Bearer ${normalizedToken}`,
      accessToken.trim(),
    ])
  ).filter((value) => value.length > 0)

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

  const failures: Array<{ status: number; message: string }> = []
  for (const authorizationValue of authCandidates) {
    const attempt = await fetchTeams(authorizationValue)
    if (attempt.response.ok) {
      return attempt.result.teams || []
    }
    failures.push({
      status: attempt.response.status,
      message: attempt.result.message || attempt.result.err || "Unknown ClickUp teams error",
    })
  }

  const [firstFailure, secondFailure] = failures
  throw new Error(
    secondFailure?.message ||
      firstFailure?.message ||
      "Unable to load ClickUp workspaces"
  )
}
