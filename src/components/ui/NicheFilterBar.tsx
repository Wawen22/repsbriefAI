'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface NicheFilterBarProps {
  niches: { id: string; label: string; count: number }[]
}

export function NicheFilterBar({ niches }: NicheFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('niche') || 'all'

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('niche')
    } else {
      params.set('niche', value)
    }
    router.replace(`${pathname}?${params.toString()}`)
  }

  const allOptions = [{ id: 'all', label: 'All', count: niches.reduce((a, n) => a + n.count, 0) }, ...niches]

  return (
    <div className="flex flex-wrap gap-2">
      {allOptions.map((n) => (
        <Button
          key={n.id}
          variant="ghost"
          size="sm"
          onClick={() => setFilter(n.id)}
          className={`rounded-full h-8 px-3 text-xs font-semibold gap-1.5 transition-all ${
            current === n.id
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          {n.label}
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
            current === n.id ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500'
          }`}>
            {n.count}
          </span>
        </Button>
      ))}
    </div>
  )
}
