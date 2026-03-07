// src/app/api/auth/notion/callback/route.ts

import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, findFirstAvailableParent } from "@/lib/integrations/notion"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error || !code || !state) {
    console.error("Notion OAuth error:", error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&error=notion_auth_failed`)
  }

  try {
    const supabase = await createClient()

    // 1. Scambio il codice per il token
    const tokenData = await exchangeCodeForToken(code)
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const { access_token, workspace_id, workspace_name, workspace_icon } = tokenData

    // 2. Cerchiamo la prima destinazione disponibile (database o pagina)
    const firstAvailable = await findFirstAvailableParent(access_token)
    const dataSourceId = firstAvailable?.type === 'data_source_id' ? firstAvailable.id : null

    // 3. Salvo o aggiorno l'integrazione nel database
    const { error: dbError } = await supabase
      .from('team_integrations')
      .upsert({
        team_id: state,
        provider: 'notion',
        encrypted_credentials: {
          access_token,
          workspace_id,
          workspace_name,
          workspace_icon
        },
        settings: {
          data_source_id: dataSourceId,
          workspace_name: workspace_name
        },
        status: 'active'
      }, { onConflict: 'team_id,provider' })

    if (dbError) throw dbError

    // 4. Log dell'evento
    const { data: integration } = await supabase
      .from('team_integrations')
      .select('id')
      .eq('team_id', state)
      .eq('provider', 'notion')
      .single()

    if (integration) {
      await supabase.from('team_integration_logs').insert({
        team_id: state,
        integration_id: integration.id,
        provider: 'notion',
        action: 'auth_success',
        status: 'success',
        event_type: 'auth_success',
        details: { workspace_name }
      })
    }

    // Redirect con successo
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&success=notion_connected`)
  } catch (err: unknown) {
    console.error("Error in Notion callback:", err)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&error=notion_setup_error`)
  }
}
