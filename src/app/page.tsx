// src/app/page.tsx

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, TrendingUp, Mail, Zap, Clock, Users } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-500 fill-blue-500" />
            <span className="text-xl font-bold tracking-tight">RepsBrief</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link>
            <Button variant="ghost" className="text-sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-sm">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge variant="outline" className="mb-4 border-blue-500 text-blue-400 px-3 py-1">
            Now Launching for Fitness Creators 🏋️
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight max-w-4xl mx-auto leading-tight">
            Stop Searching for Ideas. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Start Creating Content.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            20 high-impact content ideas every Monday, based on what's trending on Reddit, YouTube, and Google Trends. 
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg font-semibold w-full sm:w-auto">
              Get Your First Brief Free
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-slate-700 text-slate-300 w-full sm:w-auto hover:bg-slate-900">
              See a Sample Brief
            </Button>
          </div>
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full max-w-3xl mx-auto" />
            <img 
              src="/placeholder.svg" 
              alt="Dashboard Preview" 
              className="relative rounded-xl border border-slate-800 shadow-2xl mx-auto max-w-5xl"
            />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">The Research Trap</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800">
              <Clock className="w-10 h-10 text-rose-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">2-3 Hours / Week</h3>
              <p className="text-slate-400">Time wasted scrolling through subreddits and keyword tools manually.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800">
              <Users className="w-10 h-10 text-rose-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">The Echo Chamber</h3>
              <p className="text-slate-400">Repeating the same advice everyone else is giving instead of fresh trends.</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800">
              <TrendingUp className="w-10 h-10 text-rose-500 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-2">Zero Strategy</h3>
              <p className="text-slate-400">Creating content "vibes" instead of what people are actually searching for.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Content on Autopilot</h2>
            <p className="text-slate-400 max-w-xl mx-auto">We do the digging, you do the shooting.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-12">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold border border-blue-500/20">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">We Scrape the Signal</h3>
                  <p className="text-slate-400">Every Sunday night, our engine scrapes the top 1% of posts on Fitness Reddit, YouTube view velocity, and rising Google Trends.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold border border-blue-500/20">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">AI Filters the Noise</h3>
                  <p className="text-slate-400">Our content strategist AI converts raw data into actionable hooks, scripts, and descriptions tailored to your fitness niche.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold border border-blue-500/20">3</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Delivered Monday Morning</h3>
                  <p className="text-slate-400">Wake up to 20 fresh ideas in your inbox and dashboard. Start your week with your content plan already done.</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-inner">
               <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-4 animate-pulse">
                  <div className="h-4 w-3/4 bg-slate-800 rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
               </div>
               <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 mb-4">
                  <div className="h-4 w-full bg-blue-500/20 rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-blue-500/20 rounded"></div>
               </div>
               <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="h-4 w-2/3 bg-slate-800 rounded mb-2"></div>
                  <div className="h-4 w-1/3 bg-slate-800 rounded"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pricing Built for Creators</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Scale your content without scaling your research time.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter */}
            <Card className="bg-slate-950 border-slate-800 text-slate-50">
              <CardHeader>
                <CardTitle className="text-xl">Starter</CardTitle>
                <CardDescription className="text-slate-400 text-3xl font-bold text-white mt-4">$9<span className="text-base font-normal text-slate-500">/mo</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 Niche (Fitness)</div>
                <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Weekly Email</div>
                <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 20 Content Ideas</div>
                <div className="flex gap-2 text-sm text-slate-500"><CheckCircle2 className="w-4 h-4 text-slate-700" /> Dashboard Access</div>
                <Button className="w-full mt-6 variant-outline border-slate-800 text-white">Choose Starter</Button>
              </CardContent>
            </Card>

            {/* Pro */}
            <Card className="bg-slate-950 border-blue-500/50 text-slate-50 relative overflow-hidden ring-1 ring-blue-500">
              <div className="absolute top-0 right-0 bg-blue-500 text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <CardDescription className="text-slate-400 text-3xl font-bold text-white mt-4">$19<span className="text-base font-normal text-slate-500">/mo</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Full Dashboard Access</div>
                <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 3-Month History</div>
                <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Format Filters</div>
                <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Weekly Email</div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">Go Pro</Button>
              </CardContent>
            </Card>

            {/* Team */}
            <Card className="bg-slate-950 border-slate-800 text-slate-50">
              <CardHeader>
                <CardTitle className="text-xl">Team</CardTitle>
                <CardDescription className="text-slate-400 text-3xl font-bold text-white mt-4">$39<span className="text-base font-normal text-slate-500">/mo</span></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Up to 3 Niches</div>
                <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2 Users</div>
                <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> White-label Email</div>
                <div className="flex gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Advanced Analytics</div>
                <Button className="w-full mt-6 variant-outline border-slate-800 text-white">Choose Team</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500 fill-blue-500" />
            <span className="text-lg font-bold tracking-tight">RepsBrief</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-slate-500">
             <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
             <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
             <Link href="#" className="hover:text-slate-300">Support</Link>
          </div>
          <p className="text-sm text-slate-600">© 2026 RepsBrief. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
