// src/app/page.tsx

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, TrendingUp, Mail, Zap, Clock, Users, Video, Layers, Hash, Star } from "lucide-react"
import Link from "next/link"
import { SampleBriefButton } from "@/components/landing/SampleBriefButton"

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
            <Button className="bg-blue-600 hover:bg-blue-700 text-sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
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
            20 high-impact content ideas every Monday, based on what&apos;s trending on Reddit, YouTube, and Google Trends. 
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg font-semibold w-full sm:w-auto" asChild>
              <Link href="/signup">Get Your First Brief Free</Link>
            </Button>
            <SampleBriefButton />
          </div>

          {/* Dashboard Mockup (replaces placeholder.svg) */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full max-w-3xl mx-auto" />
            <div className="relative rounded-xl border border-slate-800 shadow-2xl mx-auto max-w-5xl bg-slate-900 overflow-hidden">
              {/* Fake browser bar */}
              <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-2 border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-600" />
                  <div className="w-3 h-3 rounded-full bg-slate-600" />
                  <div className="w-3 h-3 rounded-full bg-slate-600" />
                </div>
                <div className="flex-1 bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 text-center max-w-sm mx-auto">
                  repsbr ief.com/dashboard
                </div>
              </div>
              {/* Dashboard content */}
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 text-left">The Weekly Reps</h3>
                    <p className="text-xs text-slate-500 text-left">20 ideas — Monday, March 2</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                    <Zap className="w-3 h-3 mr-1 fill-emerald-500" /> Fresh Data
                  </Badge>
                </div>
                {/* Idea cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { title: "Why 10K Steps Is a Scam", hook: "Your step counter is lying to you...", format: "Reel", icon: <Video className="w-3 h-3" /> },
                    { title: "$5 Meal Prep vs $60 Supplements", hook: "I spent $5 at the store and made...", format: "Carousel", icon: <Layers className="w-3 h-3" /> },
                    { title: "3 Exercises Every Desk Worker Needs", hook: "If you sit 6+ hours a day...", format: "Thread", icon: <Hash className="w-3 h-3" /> },
                  ].map((card, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-left space-y-2">
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400 gap-1 text-[10px] py-0.5 px-1.5">
                        {card.icon} {card.format}
                      </Badge>
                      <p className="text-sm font-semibold text-slate-200 leading-snug">{card.title}</p>
                      <p className="text-[11px] italic text-blue-100/70 border-l-2 border-blue-500/20 pl-2 leading-snug">&ldquo;{card.hook}&rdquo;</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Star className="w-3 h-3 text-slate-600" />
                        <span className="text-[10px] text-slate-600">Copy Title</span>
                        <span className="text-[10px] text-slate-600">Copy Hook</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-xs text-slate-600">+ 17 more ideas below</p>
              </div>
            </div>
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
              <p className="text-slate-400">Creating content &ldquo;vibes&rdquo; instead of what people are actually searching for.</p>
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
                <Button variant="outline" className="w-full mt-6 border-slate-700 text-white hover:bg-slate-900" asChild>
                  <Link href="/signup">Choose Starter</Link>
                </Button>
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
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/signup">Go Pro</Link>
                </Button>
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
                <Button variant="outline" className="w-full mt-6 border-slate-700 text-white hover:bg-slate-900" asChild>
                  <Link href="/signup">Choose Team</Link>
                </Button>
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
          <p className="text-sm text-slate-600">&copy; 2026 RepsBrief. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
