import { decodeDataImage, downloadProviderImage, isAllowedImageContentType, isPublicAddress } from '@/lib/security/image-download'

describe('image download guards', () => {
  it.each(['127.0.0.1', '10.0.0.1', '0.1.2.3', '100.64.0.1', '192.0.0.1', '198.18.0.1', '224.0.0.1', '::1', '::ffff:127.0.0.1', 'fe80::1'])('rejects non-public address %s', (address) => {
    expect(isPublicAddress(address)).toBe(false)
  })

  it.each(['image/png', 'image/jpeg; charset=binary', 'image/webp'])('allows raster content type %s', (contentType) => {
    expect(isAllowedImageContentType(contentType)).toBe(true)
  })

  it.each(['image/svg+xml', 'image/gif', 'text/html', null])('rejects unsafe content type %s', (contentType) => {
    expect(isAllowedImageContentType(contentType)).toBe(false)
  })

  it('rejects SVG and oversized data URLs', () => {
    expect(() => decodeDataImage('data:image/svg+xml;base64,PHN2Zy8+')).toThrow()
    expect(() => decodeDataImage(`data:image/png;base64,${Buffer.alloc(10 * 1024 * 1024 + 1).toString('base64')}`)).toThrow()
  })

  it('rejects remote HTTPS URLs before fetch is invoked', async () => {
    const originalFetch = globalThis.fetch
    const fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy
    await expect(downloadProviderImage('https://images.example.com/image.png')).rejects.toThrow('Remote image URLs are not supported')
    expect(fetchSpy).not.toHaveBeenCalled()
    globalThis.fetch = originalFetch
  })

  it.each(['image/png', 'image/jpeg', 'image/webp'])('accepts raster data URL %s', async (contentType) => {
    await expect(downloadProviderImage(`data:${contentType};base64,aGVsbG8=`)).resolves.toMatchObject({ contentType })
  })
})
