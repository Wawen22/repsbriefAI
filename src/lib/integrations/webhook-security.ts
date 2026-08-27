import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

type ResolvedAddress = {
  address: string
  family: number
}

type HostResolver = (hostname: string) => Promise<ResolvedAddress[]>

const resolveHostname: HostResolver = (hostname) => lookup(hostname, { all: true, verbatim: true })

function isPublicIpv4Address(address: string) {
  const octets = address.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false
  }

  const [first, second, third] = octets
  if (first === 0 || first === 10 || first === 127 || first >= 224) return false
  if (first === 100 && second >= 64 && second <= 127) return false
  if (first === 169 && second === 254) return false
  if (first === 172 && second >= 16 && second <= 31) return false
  if (first === 192 && (second === 0 || second === 168)) return false
  if (first === 198 && (second === 18 || second === 19 || second === 51)) return false
  if (first === 203 && second === 0 && third === 113) return false
  return true
}

function isPublicIpAddress(address: string) {
  const normalized = address.replace(/^\[|\]$/g, '').toLowerCase()
  const family = isIP(normalized)
  if (family === 4) return isPublicIpv4Address(normalized)
  if (family !== 6) return false

  if (normalized === '::' || normalized === '::1') return false
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return false
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return false
  if (normalized.startsWith('ff') || normalized.startsWith('2001:db8:')) return false

  const mappedIpv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  return mappedIpv4 ? isPublicIpv4Address(mappedIpv4[1]) : true
}

export async function isSafeWebhookUrl(
  value: string,
  resolver: HostResolver = resolveHostname
): Promise<boolean> {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }

  if (url.protocol !== 'https:' || url.username || url.password) return false

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost')) return false

  if (isIP(hostname)) return isPublicIpAddress(hostname)

  try {
    const addresses = await resolver(hostname)
    return addresses.length > 0 && addresses.every(({ address }) => isPublicIpAddress(address))
  } catch {
    return false
  }
}
