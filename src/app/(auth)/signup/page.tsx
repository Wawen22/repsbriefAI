// src/app/(auth)/signup/page.tsx

"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()

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
        },
      })

      if (error) throw error
      
      // Update profile or send initial logic if needed
      if (data?.user) {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-50 text-center">
          <CardHeader>
             <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
             <CardTitle className="text-2xl font-bold italic">Check your inbox!</CardTitle>
             <CardDescription className="text-slate-400">We've sent a verification link to your email.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
             <Button variant="ghost" asChild>
                <Link href="/login" className="text-blue-500 hover:text-blue-400">Back to Login</Link>
             </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Zap className="w-10 h-10 text-blue-500 fill-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Join the 1%</CardTitle>
          <CardDescription className="text-slate-400">Start getting high-impact content ideas every week</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm rounded-lg text-center font-medium">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                className="bg-slate-950 border-slate-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                className="bg-slate-950 border-slate-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-[12px] text-slate-500 pt-1">At least 8 characters, 1 number, and 1 symbol.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11" type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Create Account"}
            </Button>
            <p className="text-sm text-slate-500 text-center">
              Already a member? <Link href="/login" className="text-blue-500 hover:text-blue-400 font-semibold tracking-wide">Sign In</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
