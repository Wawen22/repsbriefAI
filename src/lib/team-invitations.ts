export type InvitationRole = 'member' | 'admin'

export function normalizeInvitationEmail(value: string): string | null {
  const email = value.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

export function parseInvitationRole(value: string): InvitationRole | null {
  return value === 'member' || value === 'admin' ? value : null
}
