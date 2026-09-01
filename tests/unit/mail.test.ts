import { getEmailSender } from '@/lib/mail'

describe('getEmailSender', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.RESEND_FROM_EMAIL
  })

  afterAll(() => { process.env = originalEnv })

  it('fails closed without a production sender', () => {
    process.env.NODE_ENV = 'production'
    expect(getEmailSender()).toBeNull()
  })

  it('uses the configured sender in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.RESEND_FROM_EMAIL = 'RepsBrief <briefs@repsbrief.com>'
    expect(getEmailSender()).toBe('RepsBrief <briefs@repsbrief.com>')
  })
})
