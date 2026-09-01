import { lookup } from 'node:dns/promises'

const MAX_BYTES = 10 * 1024 * 1024
const TIMEOUT_MS = 10_000
const RASTER_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

export function isAllowedImageContentType(contentType: string | null) {
  return !!contentType && RASTER_TYPES.has(contentType.split(';', 1)[0].trim().toLowerCase())
}

export function isPublicAddress(address: string) {
  const mapped = /^::ffff:(.+)$/i.exec(address)?.[1]
  if (mapped) return isPublicAddress(mapped)
  if (address.includes(':')) return /^(2|3)[0-9a-f]{0,3}:/i.test(address)
  const p = address.split('.').map(Number); const [a, b, c] = p
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false
  return a !== 0 && a !== 10 && a !== 127 && a < 224 && !(a === 100 && b >= 64 && b <= 127) && !(a === 169 && b === 254) && !(a === 172 && b >= 16 && b <= 31) && !(a === 192 && (b === 0 || b === 168)) && !(a === 198 && (b === 18 || b === 19)) && !(a === 192 && b === 0 && c === 2) && !(a === 198 && b === 51 && c === 100) && !(a === 203 && b === 0 && c === 113)
}

export function decodeDataImage(source: string): { bytes: Buffer; contentType: string } {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([a-z0-9+/=]+)$/i.exec(source)
  if (!match) throw new Error('Invalid image data')
  const bytes = Buffer.from(match[2], 'base64')
  if (!bytes.length || bytes.length > MAX_BYTES) throw new Error('Image exceeds byte limit')
  return { bytes, contentType: match[1].toLowerCase() }
}

async function validateUrl(raw: string) {
  const url = new URL(raw)
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || url.hostname === 'localhost') throw new Error('Unsafe image URL')
  const addresses = await lookup(url.hostname, { all: true })
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) throw new Error('Unsafe image URL')
  return url
}

export async function downloadProviderImage(source: string): Promise<{ bytes: Buffer; contentType: string }> {
  if (source.startsWith('data:')) {
    return decodeDataImage(source)
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
    if (!response.ok || !isAllowedImageContentType(response.headers.get('content-type'))) throw new Error('Invalid image response')
    if (Number(response.headers.get('content-length') || 0) > MAX_BYTES) throw new Error('Image exceeds byte limit')
    const reader = response.body?.getReader()
    if (!reader) throw new Error('Missing image body')
    const chunks: Uint8Array[] = []; let size = 0
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_BYTES) { await reader.cancel(); throw new Error('Image exceeds byte limit') }; chunks.push(value) }
    return { bytes: Buffer.concat(chunks), contentType: response.headers.get('content-type')!.split(';')[0] }
  }
  throw new Error('Unsafe image redirect')
}
