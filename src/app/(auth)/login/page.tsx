"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 mb-2">
            <Image src="/logo.png" alt="RepsBrief" width={32} height={32} className="rounded-lg" />
            <span className="text-xl font-black tracking-tight text-white">RepsBrief</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-white">Welcome back</h1>
            <p className="text-slate-400 text-sm font-light">Sign in to your account.</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-7">
          <form onSubmit={handleLogin} className="space-y-5">
            {(error || urlError) && (
              <div className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium text-center">
                {error ?? (urlError === 'link_expired' ? 'This link has expired. Request a new one.' : 'Something went wrong.')}
              </div>
            )}

            <div className="space-y-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-blue-500/50 focus:ring-0"
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-blue-500/50 focus:ring-0"
              />
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-[11px] text-slate-500 hover:text-blue-400 transition-colors font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20 transition-all hover:scale-[1.02] group"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" /></>
              )}
            </Button>

            <p className="text-center text-xs text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                Sign up free
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
