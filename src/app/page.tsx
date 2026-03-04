import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, TrendingUp, Mail, Zap, Clock, Users, Video, Layers, Hash, Star, ArrowRight, Sparkles, Code, Orbit } from "lucide-react"
import Link from "next/link"
import { SampleBriefButton } from "@/components/landing/SampleBriefButton"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-50 selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden font-sans">
      
      {/* Background Gradients & Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Top ambient glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">RepsBrief</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
            <div className="h-4 w-px bg-white/10" />
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Button className="bg-white text-black hover:bg-slate-200 text-sm font-semibold rounded-full px-6 transition-transform hover:scale-105" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Now Launching for Fitness Creators</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tighter max-w-5xl mx-auto leading-[1.1]">
              Stop searching for ideas. <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-500">
                Start creating content.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              We scrape the top 1% of Reddit, YouTube, and Google Trends to deliver 20 high-impact content ideas to your inbox every Monday.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-14 px-8 rounded-full text-base font-semibold w-full sm:w-auto shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5 group" asChild>
                <Link href="/signup">
                  Get Your First Brief Free
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <div className="w-full sm:w-auto">
                <SampleBriefButton />
              </div>
            </div>

            {/* Floating Dashboard Mockup */}
            <div className="mt-24 relative perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20 h-full w-full pointer-events-none" />
              <div className="relative rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl mx-auto max-w-5xl overflow-hidden ring-1 ring-white/5 transform transition-all duration-700 hover:rotate-0 rotate-x-2 scale-100 sm:scale-105 lg:scale-110 mt-10">
                
                {/* Window Controls */}
                <div className="bg-white/5 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white/5 rounded-md px-4 py-1 text-xs text-slate-400 flex items-center gap-2">
                      <Code className="w-3 h-3" />
                      repsbrief.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard UI */}
                <div className="p-8 space-y-6 text-left relative overflow-hidden">
                  {/* Subtle inner glow */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">The Weekly Reps</h3>
                      <p className="text-sm text-slate-400 mt-1">20 ideas curated for March 2</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1.5">
                      <Orbit className="w-3 h-3 mr-1.5 animate-[spin_4s_linear_infinite]" /> AI Generated
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                    {[
                      { title: "Why 10K Steps Is a Scam", hook: "Your step counter is lying to you...", format: "Reel", icon: <Video className="w-3.5 h-3.5" /> },
                      { title: "$5 Meal Prep vs $60 Supplements", hook: "I spent $5 at the store and made...", format: "Carousel", icon: <Layers className="w-3.5 h-3.5" /> },
                      { title: "3 Exercises Every Desk Worker Needs", hook: "If you sit 6+ hours a day...", format: "Thread", icon: <Hash className="w-3.5 h-3.5" /> },
                    ].map((card, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 hover:bg-white/10 transition-colors cursor-pointer group">
                        <Badge variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-500/5 gap-1.5 text-xs py-1 px-2.5 rounded-md">
                          {card.icon} {card.format}
                        </Badge>
                        <p className="text-base font-semibold text-slate-100 leading-snug group-hover:text-blue-200 transition-colors">{card.title}</p>
                        <p className="text-sm text-slate-400 border-l-2 border-blue-500/30 pl-3 leading-relaxed">&ldquo;{card.hook}&rdquo;</p>
                        <div className="flex items-center gap-3 pt-2">
                          <button className="text-xs font-medium text-slate-500 hover:text-white flex items-center gap-1 transition-colors">
                            <Star className="w-3 h-3" /> Save
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-slate-950/50 border-y border-white/5" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">The Content Creator&apos;s Dilemma</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-16 text-lg">Stop losing hours to research and algorithmic guesswork.</p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { icon: <Clock className="w-6 h-6 text-rose-400" />, title: "Hours Wasted", desc: "Scrolling subreddits and analyzing keywords just to find one decent idea." },
                { icon: <Users className="w-6 h-6 text-amber-400" />, title: "The Echo Chamber", desc: "Repeating the same tired advice because you don't know what's actually trending." },
                { icon: <TrendingUp className="w-6 h-6 text-indigo-400" />, title: "Zero Strategy", desc: "Posting based on vibes instead of data-backed audience demand." }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors text-left flex flex-col items-start">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-inner">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works (Bento Box style) */}
        <section id="how-it-works" className="py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Your Content on Autopilot</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg">From raw data to ready-to-record scripts in three simple steps.</p>
            </div>
            
            <div className="grid lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
              
              {/* Step 1 */}
              <div className="lg:col-span-7 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-8 lg:p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/20 transition-all duration-500" />
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg mb-6 border border-blue-500/30">1</div>
                <h3 className="text-2xl font-bold text-white mb-4">We Scrape the Signal</h3>
                <p className="text-slate-400 text-lg mb-8 max-w-md">Our engine monitors the top 1% of Fitness Reddit, YouTube view velocity, and breakout Google Trends.</p>
                
                {/* Visual representation */}
                <div className="flex flex-col gap-3">
                  <div className="h-10 bg-white/5 rounded-lg border border-white/10 w-full animate-pulse flex items-center px-4"><div className="h-2 w-1/3 bg-white/20 rounded-full" /></div>
                  <div className="h-10 bg-white/5 rounded-lg border border-white/10 w-5/6 flex items-center px-4"><div className="h-2 w-1/2 bg-blue-500/40 rounded-full" /></div>
                  <div className="h-10 bg-white/5 rounded-lg border border-white/10 w-4/6 flex items-center px-4"><div className="h-2 w-2/3 bg-emerald-500/40 rounded-full" /></div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="lg:col-span-5 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-8 lg:p-12 relative overflow-hidden group">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg mb-6 border border-purple-500/30">2</div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Filters the Noise</h3>
                <p className="text-slate-400 text-lg mb-8">Raw data is converted into actionable hooks, scripts, and descriptions.</p>
                
                <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-xs text-purple-300/70 overflow-hidden h-32">
                  <p>{`> Analyzing trending topics...`}</p>
                  <p className="text-green-400 mt-2">{`> Found: "zone 2 cardio benefits"`}</p>
                  <p className="text-blue-400 mt-2">{`> Generating Hook: "If you're running to lose weight, stop..."`}</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="lg:col-span-12 bg-blue-600/10 border border-blue-500/20 rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_50%)]" />
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xl mb-6 text-white shadow-lg shadow-blue-500/30 relative z-10">3</div>
                <h3 className="text-3xl font-bold text-white mb-4 relative z-10">Delivered Monday Morning</h3>
                <p className="text-blue-200/80 text-lg max-w-xl mx-auto relative z-10">Wake up to 20 fresh ideas in your inbox and dashboard. Start your week with your content plan already done.</p>
                <div className="mt-8 relative z-10">
                   <Button className="bg-white text-blue-950 hover:bg-slate-100 rounded-full px-8 font-semibold shadow-xl" asChild>
                     <Link href="/signup">Start Free Trial</Link>
                   </Button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 relative">
          <div className="absolute inset-0 bg-slate-950/30 border-t border-white/5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Simple, Transparent Pricing</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg">Scale your audience without scaling your research time.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
              
              {/* Starter */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-white rounded-3xl p-2 h-fit">
                <div className="bg-white/[0.02] rounded-2xl p-6 lg:p-8 h-full">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-xl font-medium text-slate-300">Starter</CardTitle>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">$9</span>
                      <span className="text-slate-500 font-medium">/mo</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4 mb-8">
                    {['1 Niche (Fitness)', 'Weekly Email Delivery', '20 Content Ideas/week', 'Basic Dashboard Access'].map((feature, i) => (
                      <div key={i} className="flex gap-3 text-sm text-slate-300 items-center">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /> {feature}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="p-0">
                    <Button variant="outline" className="w-full rounded-full border-white/20 text-white hover:bg-white hover:text-black transition-colors" asChild>
                      <Link href="/signup">Choose Starter</Link>
                    </Button>
                  </CardFooter>
                </div>
              </Card>

              {/* Pro */}
              <Card className="bg-gradient-to-b from-blue-600/20 to-blue-900/10 backdrop-blur-md border-blue-500/30 text-white relative overflow-hidden rounded-3xl p-1 shadow-2xl shadow-blue-500/10 transform md:-translate-y-4">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                <div className="bg-black/60 rounded-[22px] p-6 lg:p-8 h-full relative">
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-1 rounded-full border-none">
                      POPULAR
                    </Badge>
                  </div>
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-xl font-medium text-blue-300">Pro</CardTitle>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">$19</span>
                      <span className="text-blue-200/50 font-medium">/mo</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4 mb-8">
                    {['Everything in Starter', 'Full Dashboard Access', '3-Month Idea History', 'Advanced Format Filters', 'Priority Support'].map((feature, i) => (
                      <div key={i} className="flex gap-3 text-sm text-slate-100 items-center">
                        <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /> {feature}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="p-0">
                    <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25" asChild>
                      <Link href="/signup">Go Pro</Link>
                    </Button>
                  </CardFooter>
                </div>
              </Card>

              {/* Team */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-white rounded-3xl p-2 h-fit">
                <div className="bg-white/[0.02] rounded-2xl p-6 lg:p-8 h-full">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-xl font-medium text-slate-300">Team</CardTitle>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">$39</span>
                      <span className="text-slate-500 font-medium">/mo</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4 mb-8">
                    {['Up to 3 Niches', '2 Team Members', 'White-label Email', 'Advanced Analytics', 'API Access (Coming Soon)'].map((feature, i) => (
                      <div key={i} className="flex gap-3 text-sm text-slate-300 items-center">
                        <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0" /> {feature}
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="p-0">
                    <Button variant="outline" className="w-full rounded-full border-white/20 text-white hover:bg-white hover:text-black transition-colors" asChild>
                      <Link href="/signup">Choose Team</Link>
                    </Button>
                  </CardFooter>
                </div>
              </Card>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-80">
            <Zap className="w-5 h-5 text-white fill-white" />
            <span className="text-lg font-bold tracking-tight text-white">RepsBrief</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-slate-500">
             <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
             <Link href="#" className="hover:text-white transition-colors">Support</Link>
          </div>
          <p className="text-sm text-slate-600">&copy; 2026 RepsBrief. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
