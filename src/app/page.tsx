import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, Clock, Users, ArrowRight, Sparkles, BrainCircuit, 
  LayoutGrid, Calendar, MousePointer2, Workflow, Share2, Globe, FileText
} from "lucide-react"
import Link from "next/link"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { PricingNexus } from "@/components/landing/PricingNexus"
import { cn } from "@/lib/utils"

import { LandingNavbar } from "@/components/landing/Navbar"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-slate-50 selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <LandingNavbar />

      <main className="relative z-10">
        
        <HeroSection />

        {/* The Studio Preview Section (Interactive Mockup) */}
        <section id="studio" className="py-24 relative overflow-hidden">
           <div className="container mx-auto px-4">
              <div className="relative rounded-[3.5rem] border border-white/10 bg-[#050505] shadow-[0_0_100px_rgba(37,99,235,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
                 {/* Browser Chrome */}
                 <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-8">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-white/10" />
                       <div className="w-3 h-3 rounded-full bg-white/10" />
                       <div className="w-3 h-3 rounded-full bg-white/10" />
                    </div>
                    <div className="bg-black/40 rounded-full px-8 py-1.5 border border-white/5 text-[9px] font-mono text-slate-500 tracking-widest uppercase">
                       repsbrief.app/studio/<b>viral-strategies</b>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/20" />
                    </div>
                 </div>

                 {/* Studio Layout Mockup */}
                 <div className="p-12 lg:p-20 grid lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-7 space-y-12">
                       <div className="space-y-4">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-black tracking-widest">PHASE 01: ATTENTION</Badge>
                          <h3 className="text-4xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                             &ldquo;The 3am Workout Myth&rdquo;
                          </h3>
                          <p className="text-xl text-slate-400 font-light italic">
                             A data-backed strategy for High-Performance Athletes.
                          </p>
                       </div>

                       <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Generated Script</span>
                             <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Sparkles className="w-3 h-3 text-purple-400" /></div>
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><FileText className="w-3 h-3 text-blue-400" /></div>
                             </div>
                          </div>
                          <div className="space-y-3">
                             <div className="h-3 w-full bg-white/10 rounded-full" />
                             <div className="h-3 w-5/6 bg-white/5 rounded-full" />
                             <div className="h-3 w-4/6 bg-white/5 rounded-full" />
                             <div className="h-3 w-full bg-white/5 rounded-full opacity-50" />
                          </div>
                       </div>
                    </div>

                    <div className="lg:col-span-5 space-y-8 bg-white/[0.01] p-8 rounded-[3rem] border border-white/5 backdrop-blur-xl">
                       <div className="space-y-6">
                          <h4 className="text-xs font-black uppercase tracking-widest text-white">Ecosystem Sync</h4>
                          <div className="space-y-3">
                             {[
                                { name: 'Notion Database', status: 'Connected', color: 'text-white' },
                                { name: 'Google Calendar', status: 'Syncing...', color: 'text-blue-400' },
                                { name: 'Zapier Webhook', status: 'Active', color: 'text-orange-400' }
                             ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black border border-white/5">
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</span>
                                   <Badge className={cn("bg-white/5 border-none text-[8px] font-black uppercase tracking-widest", item.color)}>
                                      {item.status}
                                   </Badge>
                                </div>
                             ))}
                          </div>
                       </div>
                       <Button className="w-full h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20">
                          Deploy to Channels
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <FeaturesGrid />

        {/* Brand Voice Feature Highlight */}
        <section className="py-32 bg-black relative">
           <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                 <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <BrainCircuit className="w-8 h-8" />
                 </div>
                 <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">
                    Your Voice.<br />
                    <span className="text-purple-500">Automated.</span>
                 </h2>
                 <p className="text-xl text-slate-400 font-light leading-relaxed">
                    Tired of generic AI sounding like a robot? Our <b>Brand Voice Engine</b> analyzes your existing content and builds a custom neural persona. Every generated brief feels like you wrote it yourself.
                 </p>
                 <ul className="space-y-4">
                    {['Tone & Style Matching', 'Dynamic Script Remixing', 'Audience-Specific Nuances'].map((item, i) => (
                       <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>
              <div className="relative group p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 overflow-hidden">
                 <div className="absolute inset-0 bg-purple-600/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                 <div className="space-y-6 relative z-10">
                    <div className="p-6 rounded-2xl bg-black/60 border border-white/10">
                       <p className="text-xs font-mono text-purple-400/60 mb-2">Input: Raw Trend Data</p>
                       <p className="text-sm text-slate-500 font-light">&ldquo;New study says coffee increases muscle hypertrophy by 12%...&rdquo;</p>
                    </div>
                    <div className="flex justify-center"><ArrowRight className="w-6 h-6 text-purple-500 rotate-90 lg:rotate-0" /></div>
                    <div className="p-6 rounded-2xl bg-purple-600/10 border border-purple-500/20">
                       <p className="text-xs font-mono text-purple-400 mb-2">Output: Your Brand Voice</p>
                       <p className="text-sm text-white font-medium italic">&ldquo;Stop drinking coffee for the taste. Drink it for the GAINS. Here is why...&rdquo;</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Integrations Nexus */}
        <section id="integrations" className="py-32 relative bg-white/[0.01]">
           <div className="container mx-auto px-4 text-center space-y-12">
              <div className="max-w-3xl mx-auto space-y-6">
                 <h2 className="text-5xl font-black tracking-tighter text-white uppercase">Universal Connectivity.</h2>
                 <p className="text-slate-400 text-xl font-light">
                    RepsBrief isn&apos;t an island. It&apos;s the bridge between your strategy and your favorite production tools.
                 </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                 {[
                    { icon: <LayoutGrid />, name: 'Notion', color: 'bg-white/5' },
                    { icon: <Calendar />, name: 'G-Calendar', color: 'bg-blue-500/10' },
                    { icon: <Zap />, name: 'Zapier', color: 'bg-orange-500/10' },
                    { icon: <Globe />, name: 'Webhooks', color: 'bg-emerald-500/10' }
                 ].map((item, i) => (
                    <div key={i} className={cn("p-10 rounded-3xl border border-white/5 flex flex-col items-center gap-4 hover:scale-105 transition-all cursor-default", item.color)}>
                       <div className="w-12 h-12 flex items-center justify-center opacity-80">{item.icon}</div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-white">{item.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        <PricingNexus />

      </main>

      {/* 2026 Studio Footer */}
      <footer className="py-32 border-t border-white/5 bg-[#020202] relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-20 mb-24">
            <div className="md:col-span-5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-white uppercase">RepsBrief</span>
              </div>
              <p className="text-slate-500 max-w-sm font-light text-lg leading-relaxed">
                The strategic operating system for creators and content agencies who refuse to be average.
              </p>
              <div className="flex gap-4">
                 {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors" />)}
              </div>
            </div>
            
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
               <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Platform</h5>
                  <ul className="space-y-4 text-sm text-slate-500 font-medium">
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">Strategic Studio</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">Editorial Calendar</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">AI Brand Voice</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">Multi-player Hub</li>
                  </ul>
               </div>
               <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Company</h5>
                  <ul className="space-y-4 text-sm text-slate-500 font-medium">
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">About Studio</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">Ecosystem</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">Agency Partners</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Nexus</li>
                  </ul>
               </div>
               <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Scale</h5>
                  <ul className="space-y-4 text-sm text-slate-500 font-medium">
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">Starter Plan</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">Pro Creator</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">Team Access</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors">Enterprise</li>
                  </ul>
               </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-8">
             <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em]">&copy; 2026 RepsBrief Nexus. Architecture for Impact.</p>
             <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Engine Active</span>
                </div>
                <Link href="#" className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Terms of Service</Link>
             </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
