// src/lib/integrations/notion-client.ts

/**
 * Genera l'URL di autorizzazione Notion.
 * Questa funzione è sicura da chiamare nel browser perché non contiene segreti.
 */
export const getNotionAuthUrl = (teamId: string) => {
  const clientId = "31bd872b-594c-81a6-ac1c-0037ec641c68" // Client ID è pubblico
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/notion/callback`
  
  return `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(redirectUri)}&state=${teamId}`
}
