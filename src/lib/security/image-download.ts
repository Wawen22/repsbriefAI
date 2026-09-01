import { lookup } from 'node:dns/promises'

const MAX_BYTES = 10 * 1024 * 1024
const TIMEOUT_MS = 10_000

function isPrivateAddress(address: string) {
  return address === '::1' || address.startsWith('127.') || address.startsWith('10.') || address.startsWith('192.168.') || address.startsWith('169.254.') || /^172\.(1[6-9]|2\d|3[01])\./.test(address) || address.startsWith('fc') || address.startsWith('fd') || address.startsWith('fe80:')
}

async function validateUrl(raw: string) {
  const url = new URL(raw)
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || url.hostname === 'localhost') throw new Error('Unsafe image URL')
  const addresses = await lookup(url.hostname, { all: true })
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) throw new Error('Unsafe image URL')
  return url
}

export async function downloadProviderImage(source: string): Promise<{ bytes: Buffer; contentType: string }> {
  if (source.startsWith('data:')) {
    const match = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i.exec(source)
    if (!match) throw new Error('Invalid image data')
    const bytes = Buffer.from(match[2], 'base64')
    if (!bytes.length || bytes.length > MAX_BYTES) throw new Error('Image exceeds byte limit')
    return { bytes, contentType: match[1] }
  }
  let url = await validateUrl(source)
  for (let redirects = 0; redirects <= 2; redirects++) {
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(TIMEOUT_MS) })
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      if (!location || redirects === 2) throw new Error('Unsafe image redirect')
      url = await validateUrl(new URL(location, url).toString())
      continue
    }
    if (!response.ok || !response.headers.get('content-type')?.toLowerCase().startsWith('image/')) throw new Error('Invalid image response')
    if (Number(response.headers.get('content-length') || 0) > MAX_BYTES) throw new Error('Image exceeds byte limit')
    const reader = response.body?.getReader()
    if (!reader) throw new Error('Missing image body')
    const chunks: Uint8Array[] = []; let size = 0
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_BYTES) { await reader.cancel(); throw new Error('Image exceeds byte limit') }; chunks.push(value) }
    return { bytes: Buffer.concat(chunks), contentType: response.headers.get('content-type')!.split(';')[0] }
  }
  throw new Error('Unsafe image redirect')
}
