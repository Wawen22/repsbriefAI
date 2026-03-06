/**
 * Genera l'URL di autorizzazione Google OAuth 2.0 (Client Side)
 */
export const getGoogleAuthUrl = (teamId: string) => {
  const GOOGLE_CLIENT_ID = "321772551447-0st0tur9a7g3qbubpmmtte2mfsdopdt0.apps.googleusercontent.com"
  const REDIRECT_URI = `${window.location.origin}/api/auth/google/callback`

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
    `access_type=offline&` +
    `prompt=consent`
}
