import crypto from "crypto"

const TRELLO_API_KEY = process.env.TRELLO_API_KEY
const TRELLO_API_SECRET = process.env.TRELLO_API_SECRET
const TRELLO_APP_NAME = process.env.TRELLO_APP_NAME || "RepsBrief"

const REQUEST_TOKEN_URL = "https://trello.com/1/OAuthGetRequestToken"
const AUTHORIZE_TOKEN_URL = "https://trello.com/1/OAuthAuthorizeToken"
const ACCESS_TOKEN_URL = "https://trello.com/1/OAuthGetAccessToken"

type TrelloOAuthResponse = {
  oauth_token?: string
  oauth_token_secret?: string
  oauth_callback_confirmed?: string
  error?: string
  message?: string
}

type TrelloMember = {
  id?: string
  fullName?: string
  username?: string
  email?: string
}

type TrelloWorkspace = {
  id?: string
  name?: string
  displayName?: string
}

function ensureTrelloOAuthConfig() {
  if (!TRELLO_API_KEY || !TRELLO_API_SECRET) {
    throw new Error("Trello OAuth env vars mancanti.")
  }

  return {
    key: TRELLO_API_KEY,
    secret: TRELLO_API_SECRET,
    appName: TRELLO_APP_NAME,
  }
}

function percentEncode(value: string) {
  return encodeURIComponent(value)
    .replace(/\!/g, "%21")
    .replace(/\*/g, "%2A")
    .replace(/\'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
}

function buildSignatureBaseString(method: string, url: string, params: Record<string, string>) {
  const normalizedParams = Object.entries(params)
    .sort(([aKey, aVal], [bKey, bVal]) => {
      const keyCompare = percentEncode(aKey).localeCompare(percentEncode(bKey))
      if (keyCompare !== 0) return keyCompare
      return percentEncode(aVal).localeCompare(percentEncode(bVal))
    })
    .map(([key, val]) => `${percentEncode(key)}=${percentEncode(val)}`)
    .join("&")

  return `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(normalizedParams)}`
}

function buildOAuthAuthorizationHeader(
  method: "POST" | "GET",
  url: string,
  oauthParams: Record<string, string>,
  consumerSecret: string,
  tokenSecret = ""
) {
  const baseString = buildSignatureBaseString(method, url, oauthParams)
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`
  const signature = crypto.createHmac("sha1", signingKey).update(baseString).digest("base64")

  const headerParams = {
    ...oauthParams,
    oauth_signature: signature,
  }

  const headerValue =
    "OAuth " +
    Object.entries(headerParams)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${percentEncode(key)}="${percentEncode(value)}"`)
      .join(", ")

  return headerValue
}

function parseOAuthResponse(body: string): TrelloOAuthResponse {
  const params = new URLSearchParams(body)
  return {
    oauth_token: params.get("oauth_token") || undefined,
    oauth_token_secret: params.get("oauth_token_secret") || undefined,
    oauth_callback_confirmed: params.get("oauth_callback_confirmed") || undefined,
    error: params.get("error") || undefined,
    message: params.get("message") || undefined,
  }
}

function buildOAuthParams(extra: Record<string, string>) {
  const { key } = ensureTrelloOAuthConfig()
  return {
    oauth_consumer_key: key,
    oauth_nonce: crypto.randomBytes(20).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
    ...extra,
  }
}

export async function getTrelloRequestToken(callbackUrl: string) {
  const { secret } = ensureTrelloOAuthConfig()
  const oauthParams = buildOAuthParams({
    oauth_callback: callbackUrl,
  })
  const authorization = buildOAuthAuthorizationHeader(
    "POST",
    REQUEST_TOKEN_URL,
    oauthParams,
    secret
  )

  const response = await fetch(REQUEST_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: authorization,
    },
  })

  const body = await response.text()
  const parsed = parseOAuthResponse(body)

  if (!response.ok || !parsed.oauth_token || !parsed.oauth_token_secret) {
    throw new Error(parsed.message || parsed.error || "Unable to retrieve Trello request token")
  }

  return {
    oauthToken: parsed.oauth_token,
    oauthTokenSecret: parsed.oauth_token_secret,
  }
}

export function buildTrelloAuthorizeUrl(oauthToken: string) {
  const { appName } = ensureTrelloOAuthConfig()
  const params = new URLSearchParams({
    oauth_token: oauthToken,
    name: appName,
    scope: "read,write,account",
    expiration: "never",
  })

  return `${AUTHORIZE_TOKEN_URL}?${params.toString()}`
}

export async function exchangeTrelloAccessToken(
  oauthToken: string,
  oauthVerifier: string,
  requestTokenSecret: string
) {
  const { secret } = ensureTrelloOAuthConfig()
  const oauthParams = buildOAuthParams({
    oauth_token: oauthToken,
    oauth_verifier: oauthVerifier,
  })

  const authorization = buildOAuthAuthorizationHeader(
    "POST",
    ACCESS_TOKEN_URL,
    oauthParams,
    secret,
    requestTokenSecret
  )

  const response = await fetch(ACCESS_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: authorization,
    },
  })

  const body = await response.text()
  const parsed = parseOAuthResponse(body)

  if (!response.ok || !parsed.oauth_token || !parsed.oauth_token_secret) {
    throw new Error(parsed.message || parsed.error || "Unable to retrieve Trello access token")
  }

  return {
    accessToken: parsed.oauth_token,
    accessTokenSecret: parsed.oauth_token_secret,
  }
}

export async function getTrelloMember(accessToken: string) {
  const { key } = ensureTrelloOAuthConfig()
  const params = new URLSearchParams({
    key,
    token: accessToken,
    fields: "id,fullName,username,email",
  })

  const response = await fetch(`https://api.trello.com/1/members/me?${params.toString()}`)
  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || "Unable to load Trello member info")
  }

  return (await response.json()) as TrelloMember
}

export async function getTrelloWorkspaces(accessToken: string) {
  const { key } = ensureTrelloOAuthConfig()
  const params = new URLSearchParams({
    key,
    token: accessToken,
    fields: "id,name,displayName",
  })

  const response = await fetch(`https://api.trello.com/1/members/me/organizations?${params.toString()}`)
  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || "Unable to load Trello workspaces")
  }

  return (await response.json()) as TrelloWorkspace[]
}
