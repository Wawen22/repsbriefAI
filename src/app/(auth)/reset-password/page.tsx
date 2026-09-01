'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PublicStudioShell, publicStudioClasses } from '@/components/layout/PublicStudioShell'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/dashboard'), 2000)
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
            <h1 className="text-3xl font-black tracking-tighter text-white">New password</h1>
            <p className="text-slate-400 text-sm font-light">Choose a strong password.</p>
          </div>
        </div>

        <div className={`${publicStudioClasses.surface} p-6 sm:p-7`}>
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-black">Password updated</p>
                <p className="text-slate-400 text-sm">Redirecting to dashboard…</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center">
                  {error}
                </div>
              )}
              <div className="space-y-3">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New password (8+ chars)"
                  required
                  className={publicStudioClasses.field}
                />
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm new password"
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
                  <>Update Password <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
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
