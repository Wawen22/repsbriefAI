import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, TrendingUp, Mail, Zap, Clock, Users, Video, Layers, 
  Hash, Star, ArrowRight, Sparkles, Code, Orbit, BrainCircuit, 
  LayoutGrid, Wand2, Box, Download, Smartphone, Timer, Maximize2, ShieldCheck, X
} from "lucide-react"
import Link from "next/link"
import { SampleBriefButton } from "@/components/landing/SampleBriefButton"
import { cn } from "@/lib/utils"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-50 selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden font-sans">
      
      {/* Background Gradients & Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all text-white">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">RepsBrief</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Workflow</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</Link>
            <div className="h-4 w-px bg-white/10" />
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors text-white">
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
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden text-center">
          <div className="container mx-auto px-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm font-medium mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Personalized AI Content Ecosystem for 2026</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tighter max-w-5xl mx-auto leading-[1.1] text-white">
              From viral trends to <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-500">
                Published content.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              The only content engine that learns your <b>Brand Voice</b>, manages your <b>Kanban pipeline</b>, and provides a professional <b>Teleprompter</b> for recording.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-14 px-8 rounded-full text-base font-semibold w-full sm:w-auto shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5 group" asChild>
                <Link href="/signup">
                  Get Your Free Strategy Brief
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <div className="w-full sm:w-auto text-white">
                <SampleBriefButton />
              </div>
            </div>

            {/* Immersive Mockup Showcase */}
            <div className="mt-24 relative perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20 h-full w-full pointer-events-none" />
              
              {/* Teleprompter Mockup Overlay */}
              <div className="absolute -top-12 -right-4 md:right-12 z-30 transform rotate-3 hidden md:block">
                 <div className="bg-black border border-white/10 rounded-3xl p-1 shadow-2xl w-48 overflow-hidden">
                    <div className="bg-blue-600/10 p-3 flex flex-col items-center gap-2 border-b border-white/5">
                       <Smartphone className="w-4 h-4 text-blue-400" />
                       <span className="text-[8px] font-black text-white uppercase tracking-widest">Recording Mode</span>
                    </div>
                    <div className="p-4 space-y-2">
                       <div className="h-1.5 w-full bg-white/20 rounded-full" />
                       <div className="h-1.5 w-4/5 bg-white/40 rounded-full" />
                       <div className="h-1.5 w-full bg-white/20 rounded-full" />
                       <div className="h-1.5 w-2/3 bg-blue-500/40 rounded-full" />
                    </div>
                 </div>
              </div>

              <div className="relative rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl mx-auto max-w-6xl overflow-hidden ring-1 ring-white/5 transform transition-all duration-700 hover:rotate-0 rotate-x-2 scale-100 sm:scale-105 lg:scale-110 mt-10">
                <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="bg-white/5 rounded-md px-4 py-1 text-[10px] text-slate-400 font-mono">repsbrief.app/strategy-vault</div>
                  <div className="w-10" />
                </div>

                <div className="p-8 space-y-10 text-left">
                  {/* Stats & Header Mockup */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-90">
                     {[
                       { label: 'Market Velocity', val: 'Trending Up', icon: <TrendingUp className="w-4 h-4 text-emerald-400"/>, bg: 'bg-emerald-500/10' },
                       { label: 'Voice Match', val: '98% Accuracy', icon: <BrainCircuit className="w-4 h-4 text-purple-400"/>, bg: 'bg-purple-500/10' },
                       { label: 'Production', val: '4 Ready to record', icon: <Smartphone className="w-4 h-4 text-blue-400"/>, bg: 'bg-blue-500/10' }
                     ].map((s, i) => (
                       <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                          <div className={cn("p-2 rounded-xl", s.bg)}>{s.icon}</div>
                          <div>
                             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
                             <p className="text-sm font-bold text-white">{s.val}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  {/* Kanban Mockup Preview */}
                  <div className="flex flex-col md:flex-row gap-6">
                    {["To Review", "Scripting", "Published"].map((col, i) => (
                      <div key={i} className="flex-1 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">{col}</h4>
                        <div className="space-y-3 p-2 rounded-2xl border border-white/5 bg-white/[0.01] min-h-[100px]">
                           <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3 group cursor-pointer hover:bg-white/10 transition-all">
                              <div className="flex justify-between"><Badge className="bg-blue-500/10 text-blue-400 border-none text-[8px]">Reel</Badge><Zap className="w-3 h-3 text-blue-500"/></div>
                              <div className="h-2 w-full bg-white/10 rounded-full" />
                              <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Killer Features Section */}
        <section id="features" className="py-32 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white">Strategy meets Execution.</h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-xl font-light">We don&apos;t just give you a list of ideas. We give you a production studio.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: <BrainCircuit className="w-8 h-8 text-purple-400" />,
                  title: "Brand Voice Training",
                  desc: "Our AI analyzes your past successes to extract your unique linguistic profile. Every script sounds like YOU, not a bot."
                },
                {
                  icon: <Smartphone className="w-8 h-8 text-blue-400" />,
                  title: "Mobile Teleprompter",
                  desc: "Record like a pro. Transform your phone into a professional script-scroller with adjustable speed and focus lines."
                },
                {
                  icon: <LayoutGrid className="w-8 h-8 text-emerald-400" />,
                  title: "Production Kanban",
                  desc: "A dedicated workspace to move your ideas from 'Saved' to 'Published'. Track your workflow with drag-and-drop ease."
                },
                {
                  icon: <Wand2 className="w-8 h-8 text-amber-400" />,
                  title: "AI Magic Remix",
                  desc: "Instantly change tone, platform (TikTok/YouTube), or length with one click. Your strategy is now interactive."
                },
                {
                  icon: <TrendingUp className="w-8 h-8 text-rose-400" />,
                  title: "Performance Loop",
                  desc: "Log your results and let the AI strategist learn what works for your specific audience. Growth on autopilot."
                },
                {
                  icon: <Box className="w-8 h-8 text-blue-300" />,
                  title: "Ecosystem Sync",
                  desc: "Sync your finalized strategies directly to Notion blocks or download as Markdown for your filming team."
                }
              ].map((f, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all group">
                   <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {f.icon}
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                   <p className="text-slate-400 leading-relaxed font-light text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section - Refined for 2026 Premium SaaS */}
        <section id="pricing" className="py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[120px] pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">Simple, Powerful Pricing</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg font-light">Join the top 1% of content creators scaling with data.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
              
              {/* Free Plan */}
              <Card className="bg-black/40 backdrop-blur-sm border-white/10 text-white rounded-[2.5rem] p-2 flex flex-col">
                <div className="bg-white/[0.02] rounded-[2.2rem] p-8 lg:p-10 flex-1 flex flex-col">
                  <div className="mb-8">
                    <CardTitle className="text-lg font-black text-slate-500 uppercase tracking-[0.2em]">Free Trial</CardTitle>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">$0</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">Test the engine core.</p>
                  </div>
                  <div className="space-y-4 mb-10 flex-1">
                    {['1 Custom AI Generation', '10 Weekly Ideas', 'Basic AI Remix', 'Community Support'].map((f, i) => (
                      <div key={i} className="flex gap-3 text-sm text-slate-400 items-center">
                        <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0" /> {f}
                      </div>
                    ))}
                    {['Full Kanban Board', 'Teleprompter Mode', 'Brand Voice Training'].map((f, i) => (
                      <div key={i} className="flex gap-3 text-sm text-slate-700 items-center line-through decoration-slate-800">
                        <X className="w-4 h-4 text-slate-800 shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full rounded-full border-white/10 text-slate-500 hover:bg-white hover:text-black h-12 font-bold transition-all" asChild>
                    <Link href="/signup">Start Testing</Link>
                  </Button>
                </div>
              </Card>

              {/* Pro Plan (Popular) */}
              <Card className="bg-gradient-to-b from-blue-600/30 to-blue-900/10 backdrop-blur-md border-blue-500/40 text-white relative overflow-hidden rounded-[2.5rem] p-1 shadow-2xl shadow-blue-500/10 transform md:-translate-y-6">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                <div className="bg-black/60 rounded-[2.2rem] p-8 lg:p-10 flex-1 flex flex-col relative h-full">
                  <div className="absolute top-8 right-8">
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white font-black px-3 py-1 rounded-full border-none text-[10px] tracking-widest">
                      POPULAR
                    </Badge>
                  </div>
                  <div className="mb-8">
                    <CardTitle className="text-lg font-black text-blue-400 uppercase tracking-[0.2em]">Professional</CardTitle>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-6xl font-black text-white">$19</span>
                      <span className="text-blue-200/50 font-medium">/mo</span>
                    </div>
                    <p className="text-xs text-blue-200/40 mt-2">Everything you need to grow.</p>
                  </div>
                  <div className="space-y-4 mb-10 flex-1">
                    {[
                      'Unlimited Weekly Briefs', 
                      'Full Production Board', 
                      'Mobile Teleprompter', 
                      'Brand Voice Analysis', 
                      'AI Magic Remix (Unlimited)',
                      'Notion & Markdown Sync',
                      'Priority Strategist Support'
                    ].map((f, i) => (
                      <div key={i} className="flex gap-3 text-sm text-slate-100 items-center font-medium">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                           <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> 
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black h-14 shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95" asChild>
                    <Link href="/signup">Get Full Access</Link>
                  </Button>
                </div>
              </Card>

              {/* Team Plan (Coming Soon) */}
              <Card className="bg-white/[0.02] border-white/5 text-white rounded-[2.5rem] p-2 flex flex-col relative group opacity-60">
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-[2.5rem]">
                   <Badge className="bg-white/10 border-white/20 text-white font-black px-4 py-2 uppercase tracking-[0.3em] rounded-full">Coming Q3</Badge>
                </div>
                <div className="bg-white/[0.01] rounded-[2.2rem] p-8 lg:p-10 flex-1 flex flex-col">
                  <div className="mb-8">
                    <CardTitle className="text-lg font-black text-slate-700 uppercase tracking-[0.2em]">Agency</CardTitle>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-slate-700">$39</span>
                      <span className="text-slate-800 font-medium">/mo</span>
                    </div>
                  </div>
                  <div className="space-y-4 mb-10 flex-1 text-slate-700">
                    {['Up to 3 Niches', 'Team Collaboration', 'Brand Voice for Clients', 'White-label Briefs', 'API Access'].map((f, i) => (
                      <div key={i} className="flex gap-3 text-sm items-center">
                        <ShieldCheck className="w-4 h-4 shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                  <Button disabled className="w-full rounded-full bg-white/5 border border-white/5 text-slate-700 h-12 font-bold">
                    Join Waitlist
                  </Button>
                </div>
              </Card>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-black relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-white fill-white" />
              <span className="text-xl font-bold tracking-tight text-white uppercase">RepsBrief</span>
            </div>
            <p className="text-sm text-slate-600 max-w-xs text-center md:text-left font-light">
              Elevating content creators through personalized AI and strategic data signals.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-10 text-sm font-bold uppercase tracking-widest text-slate-500">
             <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
             <Link href="#" className="hover:text-white transition-colors">Terms</Link>
             <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
             <Link href="#" className="hover:text-white transition-colors">Support</Link>
          </div>
          <p className="text-xs text-slate-700 font-mono tracking-tighter">&copy; 2026 RepsBrief Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
