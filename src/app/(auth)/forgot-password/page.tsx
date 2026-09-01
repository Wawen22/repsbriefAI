'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PublicStudioShell, publicStudioClasses } from '@/components/layout/PublicStudioShell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
  }

  return (
    <PublicStudioShell contentClassName="max-w-sm">
      <div className="w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 mb-2">
            <Image src="/logo.png" alt="RepsBrief" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-black tracking-tight text-white">RepsBrief</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-white">Reset password</h1>
            <p className="text-slate-400 text-sm font-light">We&apos;ll send you a reset link.</p>
          </div>
        </div>

        <div className={`${publicStudioClasses.surface} p-6 sm:p-7`}>
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-black">Check your inbox</p>
                <p className="text-slate-400 text-sm">Reset link sent to <span className="text-white font-semibold">{email}</span></p>
              </div>
              <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors block">
                Back to login →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center">
                  {error}
                </div>
              )}
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className={publicStudioClasses.field}
              />
              <Button
                type="submit"
                disabled={loading}
                className={`w-full h-11 text-xs group ${publicStudioClasses.primaryAction}`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Send Reset Link <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </Button>
              <p className="text-center text-xs text-slate-600">
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </PublicStudioShell>
  )
}
