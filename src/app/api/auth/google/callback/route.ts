import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForTokens } from "@/lib/integrations/google"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state") // Questo è il teamId
  const error = searchParams.get("error")

  if (error || !code || !state) {
    console.error("Google OAuth error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&error=google_auth_failed`)
  }

  try {
    const supabase = await createClient()

    // 1. Scambio il codice per i token
    const tokenData = await exchangeCodeForTokens(code)
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const { access_token, refresh_token, expires_in, id_token } = tokenData
    const expiry_date = Date.now() + (expires_in * 1000)

    // Recuperiamo le info dell'utente (opzionale, per mostrare quale account è connesso)
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { "Authorization": `Bearer ${access_token}` }
    })
    const userInfo = await userInfoResponse.json()

    // 2. Salvo o aggiorno l'integrazione nel database
    const { error: dbError } = await supabase
      .from('team_integrations')
      .upsert({
        team_id: state,
        provider: 'google_calendar',
        encrypted_credentials: {
          access_token,
          refresh_token,
          expiry_date,
          id_token
        },
        settings: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          calendar_id: 'primary' // Default
        },
        status: 'active'
      }, { onConflict: 'team_id,provider' })

    if (dbError) throw dbError

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&success=google_connected`)

  } catch (err) {
    console.error("Google Callback Error:", err)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&error=callback_processing_failed`)
  }
}
