import {
  normalizeInvitationEmail,
  parseInvitationRole,
} from '@/lib/team-invitations'

describe('team invitation validation', () => {
  it('normalizes a valid invitation email', () => {
    expect(normalizeInvitationEmail('  Collaborator@Example.com ')).toBe(
      'collaborator@example.com'
    )
  })

  it('rejects an invalid invitation email', () => {
    expect(normalizeInvitationEmail('not-an-email')).toBeNull()
  })

  it('allows only member and admin invitation roles', () => {
    expect(parseInvitationRole('member')).toBe('member')
    expect(parseInvitationRole('admin')).toBe('admin')
    expect(parseInvitationRole('owner')).toBeNull()
    expect(parseInvitationRole('anything-else')).toBeNull()
  })
})
