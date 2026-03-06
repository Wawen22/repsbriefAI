// src/app/api/auth/notion/callback/route.ts

import { NextRequest, NextResponse } from "next/server"
import { exchangeCodeForToken, getDatabaseDataSources } from "@/lib/integrations/notion"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state") // Questo è il teamId passato nell'action
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

    const { access_token, workspace_id, workspace_name, workspace_icon, duplicated_template_id } = tokenData

    // 2. Se l'utente ha selezionato un database (duplicated_template_id), 
    // recuperiamo il data_source_id per la v2025-09-03
    let dataSourceId = null
    if (duplicated_template_id) {
      const dataSources = await getDatabaseDataSources(access_token, duplicated_template_id)
      if (dataSources && dataSources.length > 0) {
        dataSourceId = dataSources[0].id
      }
    }

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
          workspace_icon,
          duplicated_template_id
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
        event_type: 'auth_success',
        details: { workspace_name }
      })
    }

    // Redirect con successo
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&success=notion_connected`)
  } catch (err: any) {
    console.error("Error in Notion callback:", err)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=integrations&error=notion_setup_error`)
  }
}
