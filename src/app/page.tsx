import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle2, TrendingUp, Mail, Zap, Clock, Users, Video, Layers, 
  Hash, Star, ArrowRight, Sparkles, Code, Orbit, BrainCircuit, 
  LayoutGrid, Wand2, Box, Download 
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
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">RepsBrief</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</Link>
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
              <span>AI Content Engine for Professional Creators</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tighter max-w-5xl mx-auto leading-[1.1]">
              Your Personal AI <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-500">
                Content Strategy Vault.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Scrape the top 1% of digital trends, train the AI on your brand voice, and manage your entire production pipeline in one immersive board.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white h-14 px-8 rounded-full text-base font-semibold w-full sm:w-auto shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5 group" asChild>
                <Link href="/signup">
                  Start Your Free Brief
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <div className="w-full sm:w-auto">
                <SampleBriefButton />
              </div>
            </div>

            {/* Floating Dashboard Mockup - Updated for 2026 implementaitons */}
            <div className="mt-24 relative perspective-1000">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-20 h-full w-full pointer-events-none" />
              <div className="relative rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl mx-auto max-w-6xl overflow-hidden ring-1 ring-white/5 transform transition-all duration-700 hover:rotate-0 rotate-x-2 scale-100 sm:scale-105 lg:scale-110 mt-10">
                
                {/* Window Controls */}
                <div className="bg-white/5 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white/5 rounded-md px-4 py-1 text-xs text-slate-400 flex items-center gap-2 font-mono">
                      <Code className="w-3 h-3 text-blue-400" />
                      repsbrief.app/production-board
                    </div>
                  </div>
                </div>

                {/* Dashboard Mockup UI */}
                <div className="p-8 space-y-10 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
                  
                  {/* Strategic Stats Header Mockup */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     {[
                       { label: 'Top Format', val: 'Reels (45%)', icon: <Video className="w-4 h-4 text-blue-400"/>, bg: 'bg-blue-500/10' },
                       { label: 'Market Sentiment', val: 'High Engagement', icon: <TrendingUp className="w-4 h-4 text-emerald-400"/>, bg: 'bg-emerald-500/10' },
                       { label: 'AI Voice', val: 'Personalized', icon: <BrainCircuit className="w-4 h-4 text-purple-400"/>, bg: 'bg-purple-500/10' }
                     ].map((s, i) => (
                       <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                          <div className={cn("p-2 rounded-xl", s.bg)}>{s.icon}</div>
                          <div>
                             <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p>
                             <p className="text-sm font-bold text-white">{s.val}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        Creator Board <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px]">LIVE</Badge>
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">Manage your weekly production pipeline</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-24 bg-white/5 rounded-full border border-white/10" />
                       <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
                    </div>
                  </div>
                  
                  {/* Kanban Mockup */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
                    {[
                      { label: "Backlog", color: "border-slate-500/30", ideas: ["Why 10K Steps is a Scam", "Protein vs Supplements"] },
                      { label: "Scripting", color: "border-blue-500/30", ideas: ["$5 Meal Prep Strategy"] },
                      { label: "Published", color: "border-emerald-500/30", ideas: ["Morning Mobility Routine"] },
                    ].map((col, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 w-fit">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{col.label}</span>
                        </div>
                        <div className={cn("rounded-2xl border border-dashed p-3 space-y-3 min-h-[120px]", col.color)}>
                           {col.ideas.map((idea, j) => (
                             <div key={j} className="bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-semibold text-slate-200 flex items-center justify-between group cursor-grab">
                                {idea}
                                <ArrowRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                             </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights - 2026 Bento Style */}
        <section id="features" className="py-32 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Built for the 2026 Creator</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg font-light">More than just ideas. A complete workflow engine powered by personalized AI.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
              
              {/* Feature 1: Brand Voice */}
              <div className="lg:col-span-8 bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/20 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10 group-hover:bg-purple-500/20 transition-all duration-500" />
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 border border-purple-500/30 shadow-lg shadow-purple-500/10">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Your AI Ghostwriter</h3>
                <p className="text-slate-400 text-lg mb-8 max-w-md font-light leading-relaxed">
                  Tired of generic AI scripts? Upload your past posts and train RepsBrief to write hooks and captions that sound 100% like you.
                </p>
                <div className="flex items-center gap-2">
                   <Badge className="bg-purple-500/10 text-purple-400 border-none px-3 py-1 uppercase text-[10px] tracking-widest font-black">Linguistic Analysis</Badge>
                   <Badge className="bg-purple-500/10 text-purple-400 border-none px-3 py-1 uppercase text-[10px] tracking-widest font-black">Style Cloning</Badge>
                </div>
              </div>

              {/* Feature 2: Magic Remix */}
              <div className="lg:col-span-4 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/30">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Magic Remix</h3>
                  <p className="text-slate-400 text-base font-light leading-relaxed">
                    Don&apos;t like a script? Hit the magic wand to instantly change tone, shorten it, or adapt it for TikTok.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 space-y-2">
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full w-2/3 bg-blue-500 animate-pulse" /></div>
                   <div className="h-2 w-4/5 bg-white/5 rounded-full" />
                </div>
              </div>

              {/* Feature 3: Kanban Board */}
              <div className="lg:col-span-5 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/30">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Production Board</h3>
                <p className="text-slate-400 text-base font-light leading-relaxed">
                  Manage your entire content lifecycle with a professional Kanban board. Drag, drop, and publish.
                </p>
                <div className="mt-10 grid grid-cols-2 gap-2">
                   <div className="h-12 bg-white/5 border border-white/10 rounded-xl" />
                   <div className="h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl" />
                </div>
              </div>

              {/* Feature 4: Ecosystem Sync */}
              <div className="lg:col-span-7 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-[2.5rem] p-10 relative overflow-hidden group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/30">
                  <Box className="w-6 h-6" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                   <div className="flex-1">
                      <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Workspace Sync</h3>
                      <p className="text-slate-400 text-lg font-light leading-relaxed">
                        Export strategies directly to Notion, Trello, or download as Markdown. Your content, anywhere you work.
                      </p>
                   </div>
                   <div className="shrink-0 space-y-3">
                      <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/10 rounded-xl">
                         <Code className="w-4 h-4 text-slate-500" /> <span className="text-xs font-bold text-white">Notion Sync</span>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2 bg-black/40 border border-white/10 rounded-xl">
                         <Download className="w-4 h-4 text-slate-500" /> <span className="text-xs font-bold text-white">Export MD</span>
                      </div>
                   </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* How it Works - Refined for 2026 Workflow */}
        <section id="how-it-works" className="py-32 relative">
          <div className="absolute inset-0 bg-slate-950/50 border-y border-white/5" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">The 2026 Production Loop</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg font-light">From viral signals to high-performing content in 3 steps.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {[
                { 
                  step: "01", 
                  title: "Train Your Voice", 
                  desc: "Paste your best past content. Our AI builds a linguistic profile to mimic your unique tone and style.",
                  icon: <BrainCircuit className="w-6 h-6 text-purple-400" />
                },
                { 
                  step: "02", 
                  title: "Receive & Remix", 
                  desc: "Every Monday, get 20 trend-backed ideas. Use the Magic Wand to instantly adapt them to your needs.",
                  icon: <Sparkles className="w-6 h-6 text-blue-400" />
                },
                { 
                  step: "03", 
                  title: "Sync & Record", 
                  desc: "Manage production on your Kanban board and sync scripts directly to Notion or your filming app.",
                  icon: <Box className="w-6 h-6 text-emerald-400" />
                }
              ].map((item, i) => (
                <div key={i} className="relative space-y-6 group">
                  <div className="text-6xl font-black text-white/5 absolute -top-10 -left-4 group-hover:text-blue-500/10 transition-colors">{item.step}</div>
                  <div className="w-14 h-14 rounded-[1.25rem] bg-white/[0.03] border border-white/10 flex items-center justify-center shadow-inner relative z-10">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white relative z-10">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-light relative z-10">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing - Keeping the updated design */}
        <section id="pricing" className="py-32 relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Simple, Transparent Pricing</h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg font-light">Scale your audience without scaling your research time.</p>
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
                    {['Brand Voice Training', 'Full Creator Board', 'AI Magic Wand Remix', 'Notion & Markdown Sync', 'Priority Support'].map((feature, i) => (
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
                    {['Up to 3 Niches', '2 Team Members', 'White-label Email', 'Advanced Analytics', 'Custom AI Personas'].map((feature, i) => (
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
