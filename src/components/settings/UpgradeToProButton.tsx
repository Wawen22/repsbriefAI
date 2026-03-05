'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'

export function UpgradeToProButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      })

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}))
        throw new Error(errorBody?.error || 'Unable to start checkout')
      }

      const session = await res.json()
      if (session?.url) {
        window.location.href = session.url
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold h-12 group shadow-lg shadow-blue-500/20"
      onClick={handleUpgrade}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          Upgrade to Pro
          <Sparkles className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
        </>
      )}
    </Button>
  )
}
