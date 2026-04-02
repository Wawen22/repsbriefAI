'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body className="bg-black text-white flex flex-col items-center justify-center min-h-screen gap-6">
        <h2 className="text-2xl font-black tracking-tight">Something went wrong</h2>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest transition-all"
        >
          Try again
        </button>
      </body>
    </html>
  )
}
