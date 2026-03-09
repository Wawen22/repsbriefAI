'use client'

import type { LucideIcon } from 'lucide-react'
import { Calendar, Cable, Globe, Layout, LayoutPanelLeft, MessageCircle, MessageSquare } from 'lucide-react'

export interface Integration {
  id: string
  provider: string
  status: 'active' | 'error' | 'expired'
  settings: Record<string, unknown> | null
  updated_at: string
}

export interface TeamWebhook {
  id: string
  name: string | null
  url: string
  events: string[]
  active: boolean
  channel: string | null
  updated_at: string
}

export type WebhookChannel = 'generic' | 'slack' | 'discord'
export type TeamRole = 'owner' | 'admin' | 'member'
export type IntegrationPanelId = 'zapier' | 'slack' | 'discord' | 'clickup' | 'trello'

export type ProviderConfig = {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  bg: string
}

export const DEFAULT_EVENTS = ['idea.approved', 'brief.ready', 'content.scheduled']

export const AVAILABLE_PROVIDERS: ProviderConfig[] = [
  {
    id: 'notion',
    name: 'Notion',
    description: 'Esporta le tue strategie direttamente in un database o pagina Notion.',
    icon: Layout,
    color: 'text-white',
    bg: 'bg-black',
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sincronizza il calendario editoriale con Google Calendar.',
    icon: Calendar,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'slack',
    name: 'Notifiche Slack',
    description: 'Invia notifiche Slack preformattate per brief, approvazioni e contenuti schedulati.',
    icon: MessageSquare,
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
  },
  {
    id: 'discord',
    name: 'Notifiche Discord',
    description: 'Invia notifiche Discord preformattate per brief, approvazioni e contenuti schedulati.',
    icon: MessageCircle,
    color: 'text-indigo-300',
    bg: 'bg-indigo-500/10',
  },
  {
    id: 'clickup',
    name: 'Task ClickUp',
    description: 'Crea task operativi dal workflow editoriale del team.',
    icon: Cable,
    color: 'text-sky-300',
    bg: 'bg-sky-500/10',
  },
  {
    id: 'trello',
    name: 'Task Trello',
    description: 'Crea card Trello da workflow editoriali e approvazioni.',
    icon: LayoutPanelLeft,
    color: 'text-blue-300',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'zapier',
    name: 'Zapier / Webhooks',
    description: 'Collega RepsBrief a oltre 5000+ app tramite webhook.',
    icon: Globe,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
]

export function normalizeWebhookChannel(channel: string | null | undefined): WebhookChannel {
  if (channel === 'slack') return 'slack'
  if (channel === 'discord') return 'discord'
  return 'generic'
}

export function getIntegrationPanelId(providerId: string): IntegrationPanelId | null {
  if (
    providerId === 'zapier' ||
    providerId === 'slack' ||
    providerId === 'discord' ||
    providerId === 'clickup' ||
    providerId === 'trello'
  ) {
    return providerId
  }

  return null
}
