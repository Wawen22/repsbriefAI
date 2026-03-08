// src/lib/integrations/notion.ts
import { createClient } from "@/lib/supabase/server"

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/notion/callback`
const NOTION_VERSION = "2025-09-03"

type NotionProperty = {
  type?: string
}

type NotionParent =
  | { type: "data_source_id"; data_source_id: string }
  | { type: "page_id"; page_id: string }

export const exchangeCodeForToken = async (code: string, redirectUri: string = REDIRECT_URI) => {
  const auth = Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString("base64")

  const response = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${auth}`,
      "Notion-Version": NOTION_VERSION
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  })

  return response.json()
}

/**
 * Cerca il primo database o pagina disponibile a cui l'integrazione ha accesso
 */
export const findFirstAvailableParent = async (accessToken: string) => {
  const response = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION
    },
    body: JSON.stringify({
      filter: { property: "object", value: "data_source" }, // Cerchiamo prima i data_sources (database)
      page_size: 1
    })
  })

  const data = await response.json()
  
  if (data.results && data.results.length > 0) {
    return { type: 'data_source_id', id: data.results[0].id }
  }

  // Se non ci sono database, cerchiamo una pagina
  const pageResponse = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Notion-Version": NOTION_VERSION
    },
    body: JSON.stringify({
      filter: { property: "object", value: "page" },
      page_size: 1
    })
  })

  const pageData = await pageResponse.json()
  if (pageData.results && pageData.results.length > 0) {
    return { type: 'page_id', id: pageData.results[0].id }
  }

  return null
}

/**
 * Recupera il nome della proprietà di tipo 'title' di un data_source o database
 */
export const getTitlePropertyName = async (accessToken: string, dataSourceId: string) => {
  const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Notion-Version": NOTION_VERSION
    }
  })
  const data = await response.json()
  if (data.properties) {
    for (const [key, value] of Object.entries(data.properties)) {
      if ((value as NotionProperty).type === 'title') return key
    }
  }
  return "title" // Fallback standard
}

/**
 * Crea una pagina in Notion usando il modello data_source_id o page_id
 */
export const exportToNotion = async (teamId: string, briefContent: string, title: string) => {
  const supabase = await createClient()

  const { data: integration, error } = await supabase
    .from('team_integrations')
    .select('*')
    .eq('team_id', teamId)
    .eq('provider', 'notion')
    .single()

  if (error || !integration) throw new Error('Notion non connesso')

  const { access_token } = integration.encrypted_credentials
  
  let parent: NotionParent | null = null
  let titleProperty = "title"

  // 1. Identifichiamo il parent (Data Source o Page)
  if (integration.settings?.data_source_id) {
    parent = { type: "data_source_id", data_source_id: integration.settings.data_source_id }
    // Per i database, dobbiamo scoprire il nome della colonna titolo
    titleProperty = await getTitlePropertyName(access_token, integration.settings.data_source_id)
  } else {
    const firstAvailable = await findFirstAvailableParent(access_token)
    if (firstAvailable) {
      if (firstAvailable.type === 'data_source_id') {
        parent = { type: 'data_source_id', data_source_id: firstAvailable.id }
        titleProperty = await getTitlePropertyName(access_token, firstAvailable.id)
      } else {
        parent = { type: 'page_id', page_id: firstAvailable.id }
      }
    }
  }

  if (!parent) {
    throw new Error('Nessuna destinazione trovata in Notion. Assicurati di aver dato accesso ad almeno un database o una pagina.')
  }

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${access_token}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION
    },
    body: JSON.stringify({
      parent,
      properties: {
        [titleProperty]: { 
          title: [{ text: { content: title } }] 
        }
      },
      children: [
        {
          object: "block",
          type: "heading_2",
          heading_2: { rich_text: [{ text: { content: "Strategic Brief" } }] }
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: { rich_text: [{ text: { content: briefContent.substring(0, 2000) } }] }
        }
      ]
    })
  })

  const result = await response.json()
  if (result.object === 'error') {
    throw new Error(result.message || 'Errore Notion API')
  }

  return result
}
