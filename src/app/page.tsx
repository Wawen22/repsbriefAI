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
      
      {/* Global Atmosphere & Depth Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-blue-600/[0.03] blur-[120px] rounded-full" />
      </div>

      <LandingNavbar />

      <main className="relative z-10">
        
        <HeroSection />

        {/* Divider 01 */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Section: Studio Preview with slightly lighter background */}
        <section id="studio" className="py-32 relative overflow-hidden bg-[#030303]">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.02),transparent_50%)]" />
           <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16 space-y-4">
                 <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">The Studio Nexus.</h2>
                 <p className="text-slate-500 max-w-xl mx-auto text-sm font-medium uppercase tracking-widest">Where trend data transforms into production-ready assets.</p>
              </div>
              
              <div className="relative group max-w-6xl mx-auto">
                 {/* Glow Effect behind mockup */}
                 <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000" />
                 
                 <div className="relative rounded-[3.5rem] border border-white/10 bg-[#050505] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
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
                             <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-black tracking-widest uppercase">Phase 01: Attention Architecture</Badge>
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

                       <div className="lg:col-span-5 space-y-8 bg-white/[0.01] p-8 rounded-[3rem] border border-white/5 backdrop-blur-xl shadow-2xl">
                          <div className="space-y-6">
                             <h4 className="text-xs font-black uppercase tracking-widest text-white">Ecosystem Sync</h4>
                             <div className="space-y-3">
                                {[
                                   { name: 'Notion Database', status: 'Connected', color: 'text-white' },
                                   { name: 'Google Calendar', status: 'Syncing...', color: 'text-blue-400' },
                                   { name: 'Zapier Webhook', status: 'Active', color: 'text-orange-400' }
                                ].map((item, i) => (
                                   <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black border border-white/5 group hover:border-white/20 transition-all">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.name}</span>
                                      <Badge className={cn("bg-white/5 border-none text-[8px] font-black uppercase tracking-widest", item.color)}>
                                         {item.status}
                                      </Badge>
                                   </div>
                                ))}
                             </div>
                          </div>
                          <Button className="w-full h-14 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 transition-all hover:scale-[1.02]">
                             Deploy to Channels
                          </Button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Divider 02 */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <FeaturesGrid />

        {/* Divider 03 */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

        {/* Brand Voice Feature Highlight */}
        <section className="py-40 bg-[#020202] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(147,51,234,0.03),transparent_50%)]" />
           <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-24 items-center relative z-10">
              <div className="space-y-8 text-left">
                 <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(147,51,234,0.2)]">
                    <BrainCircuit className="w-8 h-8" />
                 </div>
                 <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-[0.9]">
                    Your Voice.<br />
                    <span className="text-purple-500">Automated.</span>
                 </h2>
                 <p className="text-xl text-slate-400 font-light leading-relaxed max-w-md">
                    Generic AI is dead. Our <b>Neural Persona Engine</b> clones your specific tone, humor, and vocabulary for scripts that convert.
                 </p>
                 <div className="space-y-4">
                    {['Tone & Vocabulary Analysis', 'Dynamic Style Injection', 'Multi-Language Persona Sync'].map((item, i) => (
                       <div key={i} className="flex items-center gap-4 text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                          <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.8)]" />
                          {item}
                       </div>
                    ))}
                 </div>
              </div>
              
              <div className="relative p-1.5 rounded-[3.5rem] bg-gradient-to-br from-white/10 to-transparent">
                 <div className="relative p-12 rounded-[3.4rem] bg-black border border-white/5 overflow-hidden group">
                    <div className="absolute inset-0 bg-purple-600/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className="space-y-8 relative z-10">
                       <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 transform transition-transform group-hover:-translate-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-purple-400/60 mb-4">Input: Raw Trend Data</p>
                          <p className="text-base text-slate-500 font-light leading-relaxed">&ldquo;New study says coffee increases muscle hypertrophy by 12% in athletes...&rdquo;</p>
                       </div>
                       <div className="flex justify-center"><ArrowRight className="w-8 h-8 text-purple-500 rotate-90 lg:rotate-0 animate-pulse" /></div>
                       <div className="p-8 rounded-3xl bg-purple-600/10 border border-purple-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform transition-transform group-hover:translate-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-4">Output: Neural Persona Match</p>
                          <p className="text-lg text-white font-bold italic leading-relaxed selection:bg-purple-500/50">&ldquo;Stop drinking coffee for the taste. Drink it for the GAINS. New science just dropped...&rdquo;</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Divider 04 */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

        {/* Integrations Nexus */}
        <section id="integrations" className="py-40 relative bg-black">
           <div className="container mx-auto px-4 text-center space-y-20">
              <div className="max-w-3xl mx-auto space-y-6">
                 <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">Universal Ecosystem</Badge>
                 <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">The Open Nexus.</h2>
                 <p className="text-slate-400 text-xl font-light leading-relaxed">
                    Connect RepsBrief to your existing production stack. From CMS to Task Management, we speak every language.
                 </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                 {[
                    { icon: <LayoutGrid className="w-8 h-8" />, name: 'Notion', color: 'hover:border-white/40', bg: 'bg-white/5' },
                    { icon: <Calendar className="w-8 h-8" />, name: 'Google', color: 'hover:border-blue-500/40', bg: 'bg-blue-500/10' },
                    { icon: <Zap className="w-8 h-8" />, name: 'Zapier', color: 'hover:border-orange-500/40', bg: 'bg-orange-500/10' },
                    { icon: <Globe className="w-8 h-8" />, name: 'Webhooks', color: 'hover:border-emerald-500/40', bg: 'bg-emerald-500/10' }
                 ].map((item, i) => (
                    <div key={i} className={cn("p-12 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-6 transition-all cursor-pointer group", item.color, item.bg)}>
                       <div className="flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500">{item.icon}</div>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-60 group-hover:opacity-100">{item.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Final Divider before pricing */}
        <div className="w-full h-32 bg-gradient-to-b from-black to-[#050505]" />

        <PricingNexus />

      </main>

      {/* 2026 Studio Footer */}
      <footer className="py-32 border-t border-white/5 bg-[#020202] relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-12 gap-20 mb-24">
            <div className="md:col-span-5 space-y-8 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-white uppercase italic">RepsBrief</span>
              </div>
              <p className="text-slate-500 max-w-sm font-light text-lg leading-relaxed">
                The strategic operating system for creators and content agencies who refuse to be average.
              </p>
              <div className="flex gap-4">
                 {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all" />)}
              </div>
            </div>
            
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12 text-left">
               <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Platform</h5>
                  <ul className="space-y-4 text-sm text-slate-500 font-medium">
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">Strategic Studio</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">Editorial Calendar</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">AI Brand Voice</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">Multi-player Hub</li>
                  </ul>
               </div>
               <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Company</h5>
                  <ul className="space-y-4 text-sm text-slate-500 font-medium">
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">About Studio</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">Ecosystem</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">Agency Partners</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">Privacy Nexus</li>
                  </ul>
               </div>
               <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Scale</h5>
                  <ul className="space-y-4 text-sm text-slate-500 font-medium">
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">Starter Plan</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">Pro Creator</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">Team Access</li>
                     <li className="hover:text-blue-400 cursor-pointer transition-colors uppercase tracking-widest text-[10px] font-black">Enterprise</li>
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
