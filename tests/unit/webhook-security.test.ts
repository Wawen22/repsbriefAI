import { isSafeWebhookUrl } from '@/lib/integrations/webhook-security'

const resolvePublicAddress = async () => [{ address: '93.184.216.34', family: 4 }]

describe('webhook URL security', () => {
  it('accepts an HTTPS endpoint that resolves to a public address', async () => {
    await expect(
      isSafeWebhookUrl('https://hooks.example.com/repsbrief', resolvePublicAddress)
    ).resolves.toBe(true)
  })

  it.each([
    'http://hooks.example.com/repsbrief',
    'https://user:password@hooks.example.com/repsbrief',
    'https://localhost/repsbrief',
    'https://127.0.0.1/repsbrief',
    'https://192.168.1.10/repsbrief',
    'https://[::1]/repsbrief',
  ])('rejects an unsafe webhook URL: %s', async (url) => {
    await expect(isSafeWebhookUrl(url, resolvePublicAddress)).resolves.toBe(false)
  })

  it('rejects a hostname that resolves to a private address', async () => {
    await expect(
      isSafeWebhookUrl('https://internal.example.com/repsbrief', async () => [
        { address: '10.0.0.8', family: 4 },
      ])
    ).resolves.toBe(false)
  })
})
