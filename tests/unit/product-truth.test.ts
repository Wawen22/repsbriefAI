import { activeSourceLabels, isActiveSource } from '@/lib/product-truth'

describe('product truth', () => {
  it('exposes only configured active trend sources', () => {
    expect(activeSourceLabels()).toEqual(['YouTube', 'RSS feeds'])
  })

  it('rejects inactive sources from public copy', () => {
    expect(isActiveSource('youtube')).toBe(true)
    expect(isActiveSource('rss')).toBe(true)
    expect(isActiveSource('reddit')).toBe(false)
    expect(isActiveSource('google-trends')).toBe(false)
  })
})
