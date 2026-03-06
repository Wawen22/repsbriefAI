import { createClient } from "@/lib/supabase/server"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

/**
 * Genera l'URL di autorizzazione Google OAuth 2.0
 */
export const getGoogleAuthUrl = (teamId: string) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'openid'
  ]

  return `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes.join(' '))}&` +
    `state=${teamId}&` +
    `access_type=offline&` + // Essenziale per ottenere il refresh_token
    `prompt=consent`         // Forza la richiesta di refresh_token ogni volta
}

/**
 * Scambia il codice per i token (Access & Refresh)
 */
export const exchangeCodeForTokens = async (code: string) => {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code"
    })
  })

  return await response.json()
}

/**
 * Rinnova l'access_token usando il refresh_token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token"
    })
  })

  return await response.json()
}

/**
 * Crea un evento su Google Calendar
 */
export const createCalendarEvent = async (teamId: string, event: {
  summary: string,
  description: string,
  startDateTime: string,
  endDateTime: string
}) => {
  const supabase = await createClient()

  // 1. Recupero credenziali
  const { data: integration, error } = await supabase
    .from('team_integrations')
    .select('*')
    .eq('team_id', teamId)
    .eq('provider', 'google_calendar')
    .single()

  if (error || !integration) throw new Error('Google Calendar non connesso')

  let { access_token, refresh_token, expiry_date } = integration.encrypted_credentials

  // 2. Controllo se il token è scaduto (o scadrà a breve)
  if (Date.now() >= expiry_date - 60000) {
    const refreshed = await refreshAccessToken(refresh_token)
    access_token = refreshed.access_token
    expiry_date = Date.now() + (refreshed.expires_in * 1000)

    // Aggiorniamo il token nel DB per il futuro
    await supabase.from('team_integrations').update({
      encrypted_credentials: {
        ...integration.encrypted_credentials,
        access_token,
        expiry_date
      }
    }).eq('id', integration.id)
  }

  // 3. Chiamata API per creare l'evento
  const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startDateTime, timeZone: 'UTC' },
      end: { dateTime: event.endDateTime, timeZone: 'UTC' },
      reminders: { useDefault: true }
    })
  })

  const result = await response.json()
  if (result.error) throw new Error(result.error.message || 'Errore Google Calendar API')

  return result
}
