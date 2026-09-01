const MAX_BYTES = 10 * 1024 * 1024
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

export async function downloadProviderImage(source: string): Promise<{ bytes: Buffer; contentType: string }> {
  if (!source.startsWith('data:')) throw new Error('Remote image URLs are not supported')
  return decodeDataImage(source)
}
