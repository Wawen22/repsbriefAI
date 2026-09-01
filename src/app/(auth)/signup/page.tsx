'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { PublicStudioShell, publicStudioClasses } from '@/components/layout/PublicStudioShell'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function SignupForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [refCode, setRefCode] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fromUrl = searchParams.get('ref')
    const fromCookie = getCookie('repsbrief_ref')
    setRefCode(fromUrl || fromCookie || null)
  }, [searchParams])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: refCode ? { referred_by: refCode } : undefined,
        },
      })

      if (error) throw error
      if (data?.user) setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">Check your inbox</h2>
          <p className="text-slate-400 text-sm">We sent a verification link to <span className="text-white font-semibold">{email}</span></p>
        </div>
        <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors">
          Back to login →
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSignup} className="space-y-5">
      {refCode && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold text-emerald-400">You were invited — Pro trial included</p>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className={publicStudioClasses.field}
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (8+ chars)"
          required
          className={publicStudioClasses.field}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className={`w-full h-11 text-xs group ${publicStudioClasses.primaryAction}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>Create Account <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
        )}
      </Button>

      <p className="text-center text-xs text-slate-600">
        Already a member?{' '}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
          Sign in
        </Link>
      </p>

      <p className="text-center text-[10px] text-slate-700 leading-relaxed">
        By creating an account you agree to our{' '}
        <Link href="/terms" className="text-slate-500 hover:text-white transition-colors underline">Terms</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-slate-500 hover:text-white transition-colors underline">Privacy Policy</Link>
      </p>
    </form>
  )
}

export default function SignupPage() {
  return (
    <PublicStudioShell contentClassName="max-w-sm">
      <div className="w-full space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 mb-2">
            <Image src="/logo.png" alt="RepsBrief" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-black tracking-tight text-white">RepsBrief</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-white">Join the 1%</h1>
            <p className="text-slate-400 text-sm font-light">20 trend-backed ideas, every week. Free.</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span className="text-emerald-500">✓ Free forever</span>
            <span>·</span>
            <span className="text-emerald-500">✓ Pro: 7-day trial</span>
            <span>·</span>
            <span className="text-emerald-500">✓ No card</span>
          </div>
        </div>

        {/* Form */}
        <div className={`${publicStudioClasses.surface} p-6 sm:p-7`}>
          <Suspense>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </PublicStudioShell>
  )
}
