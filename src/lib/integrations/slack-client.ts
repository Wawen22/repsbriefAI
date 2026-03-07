/**
 * Builds Slack OAuth URL (client side).
 */
export function getSlackAuthUrl(teamId: string) {
  const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID
  if (!clientId) {
    throw new Error("Slack client ID non configurato.")
  }

  const scopes = ["incoming-webhook"]

  const params = new URLSearchParams({
    client_id: clientId,
    scope: scopes.join(" "),
    state: teamId,
  })

  return `https://slack.com/oauth/v2/authorize?${params.toString()}`
}
