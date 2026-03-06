import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, TrendingUp, Mail, Zap, Clock, Users, Video, Layers, 
  Hash, Star, ArrowRight, Sparkles, Code, Orbit, BrainCircuit, 
  LayoutGrid, Wand2, Box, Download, Smartphone, Timer, Maximize2, ShieldCheck, X,
  Calendar,
  Lock,
  MousePointer2,
  Workflow,
  Share2
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
            <span className="text-xl font-semibold tracking-tight text-white uppercase tracking-tighter">RepsBrief</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Workflow</Link>
            <Link href="#pricing" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Pricing</Link>
            <div className="h-4 w-px bg-white/10" />
            <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors">
              Login
            </Link>
            <Button className="bg-white text-black hover:bg-slate-200 text-[10px] font-black uppercase tracking-widest rounded-full px-6 transition-all hover:scale-105" asChild>
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
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-player Content Studio</span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tighter max-w-6xl mx-auto leading-[0.9] text-white">
              The Strategic <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-500">
                Hub for Creators.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Stop guessing. Start building. From viral trend discovery to professional script production—RepsBrief is the data-backed Studio built for <b>Solo Creators</b> and <b>Scaling Agencies</b>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-16 px-10 rounded-full text-xs font-black uppercase tracking-widest w-full sm:w-auto shadow-2xl shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-1 group" asChild>
                <Link href="/signup">
                  Launch Your Studio
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <div className="w-full sm:w-auto">
                <SampleBriefButton />
              </div>
            </div>

            {/* Immersive Mockup Showcase */}
            <div className="mt-24 relative perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20 h-full w-full pointer-events-none" />
              
              {/* Floating Dashboard Elements */}
              <div className="absolute -top-12 -right-4 md:right-12 z-30 transform rotate-3 hidden md:block">
                 <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-1 shadow-2xl w-56 overflow-hidden">
                    <div className="bg-blue-600/10 p-4 flex flex-col items-center gap-2 border-b border-white/5">
                       <ShieldCheck className="w-5 h-5 text-emerald-400" />
                       <span className="text-[9px] font-black text-white uppercase tracking-widest">Admin Approved</span>
                    </div>
                    <div className="p-5 space-y-3">
                       <div className="h-2 w-full bg-white/10 rounded-full" />
                       <div className="h-2 w-4/5 bg-white/5 rounded-full" />
                       <div className="pt-2 flex justify-end">
                          <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-black" />
                          <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-black -ml-2" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="relative rounded-[3rem] border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl mx-auto max-w-6xl overflow-hidden ring-1 ring-white/5 transform transition-all duration-1000 hover:rotate-0 rotate-x-2 scale-100 sm:scale-105 lg:scale-110 mt-10">
                <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="bg-white/5 rounded-full px-6 py-1.5 text-[10px] text-slate-500 font-mono tracking-widest uppercase">studio.repsbrief.app/workspace</div>
                  <div className="flex items-center gap-2">
                     <Users className="w-4 h-4 text-slate-600" />
                     <div className="w-6 h-6 rounded-full bg-white/10" />
                  </div>
                </div>

                <div className="p-10 space-y-12 text-left">
                  {/* Stats & Header Mockup */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-90">
                     {[
                       { label: 'Team Velocity', val: '+240% Growth', icon: <TrendingUp className="w-5 h-5 text-emerald-400"/>, bg: 'bg-emerald-500/10' },
                       { label: 'Brand Persona', val: 'Global Sync', icon: <BrainCircuit className="w-5 h-5 text-purple-400"/>, bg: 'bg-purple-500/10' },
                       { label: 'Scheduled', val: '12 Posts Active', icon: <Calendar className="w-5 h-5 text-blue-400"/>, bg: 'bg-blue-500/10' }
                     ].map((s, i) => (
                       <div key={i} className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 flex items-center gap-5">
                          <div className={cn("p-3 rounded-2xl", s.bg)}>{s.icon}</div>
                          <div>
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
                             <p className="text-lg font-bold text-white tracking-tight">{s.val}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  {/* Kanban Mockup Preview */}
                  <div className="flex flex-col md:flex-row gap-8">
                    {["Pending Review", "Approved", "Editorial Calendar"].map((col, i) => (
                      <div key={i} className="flex-1 space-y-5">
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-3">{col}</h4>
                        <div className="space-y-4 p-3 rounded-[2rem] border border-white/5 bg-white/[0.01] min-h-[160px]">
                           <div className="bg-white/[0.04] border border-white/10 p-5 rounded-2xl space-y-4 group cursor-pointer hover:bg-white/[0.08] transition-all">
                              <div className="flex justify-between items-center">
                                 <Badge className="bg-pink-500/10 text-pink-400 border-none text-[9px] font-black uppercase">Reel</Badge>
                                 <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                              </div>
                              <div className="h-2 w-full bg-white/10 rounded-full" />
                              <div className="h-2 w-2/3 bg-white/5 rounded-full" />
                              <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                 <div className="w-5 h-5 rounded-full bg-blue-500/50" />
                                 <span className="text-[8px] font-bold text-slate-600 uppercase">Creator: Marco</span>
                              </div>
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

        {/* Studio Core Section */}
        <section id="features" className="py-32 relative bg-white/[0.01]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white">The Studio Architecture.</h2>
              <p className="text-slate-400 max-w-3xl mx-auto text-xl font-light leading-relaxed">
                RepsBrief isn&apos;t just an AI tool. It&apos;s a collaborative production environment designed to move strategies from concept to camera in minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: <Users className="w-8 h-8 text-blue-400" />,
                  title: "Team Workspaces",
                  desc: "Invite creators, editors, and admins. Centralize your niche research and maintain 100% visibility over the production pipeline."
                },
                {
                  icon: <BrainCircuit className="w-8 h-8 text-purple-400" />,
                  title: "Shared AI Persona",
                  desc: "Train the AI once on your brand&apos;s unique voice. Now every team member can generate scripts that sound exactly like you."
                },
                {
                  icon: <Workflow className="w-8 h-8 text-emerald-400" />,
                  title: "Approval Workflow",
                  desc: "Professional content gating. Members submit, Admins approve. No more 'off-brand' content hitting your channels."
                },
                {
                  icon: <Calendar className="w-8 h-8 text-rose-400" />,
                  title: "Editorial Calendar",
                  desc: "Plan your month across Instagram, TikTok, and LinkedIn in one unified grid. Strategic scheduling has never been this fluid."
                },
                {
                  icon: <Maximize2 className="w-8 h-8 text-cyan-400" />,
                  title: "Full-Screen Studio",
                  desc: "An immersive environment for high-focus strategy remixing. Teleprompter, script-drafting, and distribution tools in one view."
                },
                {
                  icon: <Share2 className="w-8 h-8 text-amber-400" />,
                  title: "Agency White-Label",
                  desc: "Share strategy briefs with clients via professional, private URLs. Your brand, your insights, our technology."
                }
              ].map((f, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 hover:bg-white/[0.04] hover:border-white/10 transition-all group relative overflow-hidden">
                   <div className="absolute -bottom-4 -right-4 p-8 opacity-[0.02] group-hover:scale-150 transition-transform duration-700">
                      {f.icon}
                   </div>
                   <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-white/10 transition-all">
                      {f.icon}
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{f.title}</h3>
                   <p className="text-slate-400 leading-relaxed font-light text-base">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section - Refined for Team Scaling */}
        <section id="pricing" className="py-32 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[120px] pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter text-white uppercase">Pick Your Power.</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-xl font-light">Join the top 1% of content studios scaling with strategic data.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
              
              {/* Free Plan */}
              <Card className="bg-black border-white/5 text-white rounded-[3rem] p-3 flex flex-col group hover:border-white/10 transition-all">
                <div className="bg-white/[0.02] rounded-[2.8rem] p-10 lg:p-12 flex-1 flex flex-col">
                  <div className="mb-10">
                    <CardTitle className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Individual</CardTitle>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-6xl font-black text-white">$0</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-3 font-bold uppercase tracking-widest">Test the Studio Core.</p>
                  </div>
                  <div className="space-y-5 mb-12 flex-1">
                    {['1 Weekly Strategic Brief', '10 AI Trend Ideas', 'Basic Studio Access', 'Markdown Export'].map((f, i) => (
                      <div key={i} className="flex gap-4 text-sm text-slate-500 items-center font-medium">
                        <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" /> {f}
                      </div>
                    ))}
                    {['Editorial Calendar', 'Brand Persona Sync', 'Team Collaboration'].map((f, i) => (
                      <div key={i} className="flex gap-4 text-sm text-slate-800 items-center line-through decoration-slate-800 opacity-40">
                        <Lock className="w-3.5 h-3.5 text-slate-800 shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full rounded-full border-white/10 text-slate-400 hover:bg-white hover:text-black h-14 text-xs font-black uppercase tracking-widest transition-all" asChild>
                    <Link href="/signup">Start Free</Link>
                  </Button>
                </div>
              </Card>

              {/* Pro Plan (Popular) */}
              <Card className="bg-gradient-to-br from-blue-600/20 via-black to-black backdrop-blur-xl border-blue-500/30 text-white relative overflow-hidden rounded-[3rem] p-1.5 shadow-2xl shadow-blue-500/10 transform md:-translate-y-8 transition-transform hover:-translate-y-10 duration-500">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                <div className="bg-black/80 rounded-[2.8rem] p-10 lg:p-12 flex-1 flex flex-col relative h-full">
                  <div className="absolute top-10 right-10">
                    <Badge className="bg-blue-500 text-white font-black px-4 py-1.5 rounded-full border-none text-[10px] tracking-widest animate-pulse">
                      MOST POPULAR
                    </Badge>
                  </div>
                  <div className="mb-10">
                    <CardTitle className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Pro Creator</CardTitle>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-7xl font-black text-white">$19</span>
                      <span className="text-blue-200/50 font-bold uppercase text-xs tracking-widest">/mo</span>
                    </div>
                    <p className="text-xs text-blue-300/40 mt-3 font-bold uppercase tracking-widest">Master your personal brand.</p>
                  </div>
                  <div className="space-y-5 mb-12 flex-1">
                    {[
                      'Unlimited Strategic Briefs', 
                      'Full Studio Hub Access', 
                      'AI Persona Training', 
                      'Editorial Calendar', 
                      'Advanced AI Remixing',
                      'Notion & Public Share Links'
                    ].map((f, i) => (
                      <div key={i} className="flex gap-4 text-sm text-slate-100 items-center font-bold">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/20">
                           <CheckCircle2 className="w-4 h-4 text-blue-400" /> 
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest h-16 shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 active:scale-95" asChild>
                    <Link href="/signup">Get Pro Access</Link>
                  </Button>
                </div>
              </Card>

              {/* Team Plan */}
              <Card className="bg-black border-emerald-500/20 text-white rounded-[3rem] p-3 flex flex-col group hover:border-emerald-500/40 transition-all relative overflow-hidden">
                <div className="bg-white/[0.02] rounded-[2.8rem] p-10 lg:p-12 flex-1 flex flex-col">
                  <div className="mb-10">
                    <CardTitle className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Team Studio</CardTitle>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-6xl font-black text-white">$39</span>
                      <span className="text-slate-600 font-bold uppercase text-xs tracking-widest">/mo</span>
                    </div>
                    <p className="text-xs text-emerald-500/40 mt-3 font-bold uppercase tracking-widest">Scale with collaborators.</p>
                  </div>
                  <div className="space-y-5 mb-12 flex-1">
                    {[
                      'Everything in Pro',
                      'Up to 5 Team Seats',
                      'Approval Workflows',
                      'Shared Workspace Persona',
                      'White-label Strategy Pages',
                      'Admin Content Oversight'
                    ].map((f, i) => (
                      <div key={i} className="flex gap-4 text-sm text-slate-300 items-center font-semibold">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/10">
                           <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                  <Button className="w-full rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest h-14 shadow-2xl shadow-emerald-500/20 transition-all" asChild>
                    <Link href="/signup">Scale My Team</Link>
                  </Button>
                </div>
              </Card>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-black relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-6">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-white fill-white" />
              <span className="text-2xl font-black tracking-tighter text-white uppercase tracking-widest">RepsBrief</span>
            </div>
            <p className="text-sm text-slate-600 max-w-xs text-center md:text-left font-medium leading-relaxed">
              The first AI-powered Studio for modern content teams. Architecture for high-impact creators.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
             <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
             <Link href="#" className="hover:text-white transition-colors">Terms</Link>
             <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
             <Link href="#" className="hover:text-white transition-colors">Support</Link>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
             <p className="text-[10px] text-slate-700 font-mono tracking-tighter">&copy; 2026 RepsBrief Studio. AI Optimized.</p>
             <div className="flex gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-500" />
                <div className="w-1 h-1 rounded-full bg-purple-500" />
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
             </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
