'use client'

import { 
  Users, BrainCircuit, Workflow, Calendar, Maximize2, Share2, 
  ShieldCheck, Smartphone, Target, Globe, Zap, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

const FEATURES = [
  {
    icon: <Users className="w-6 h-6 text-blue-400" />,
    title: "Multi-Player Workspaces",
    desc: "Invite creators, editors, and admins. Maintain 100% visibility over your production pipeline.",
    category: "Team"
  },
  {
    icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
    title: "AI Brand Voice Sync",
    desc: "Clone your personality. Every script sounds exactly like you, no matter who generates it.",
    category: "AI"
  },
  {
    icon: <Workflow className="w-6 h-6 text-emerald-400" />,
    title: "Approval Guardrails",
    desc: "Gated production flow. Members submit strategies, Admins approve. Scale without losing quality.",
    category: "Flow"
  },
  {
    icon: <Calendar className="w-6 h-6 text-rose-400" />,
    title: "Editorial Nexus",
    desc: "A unified view for IG, TikTok, and YouTube. Sync with Google Calendar in one click.",
    category: "Plan"
  },
  {
    icon: <Maximize2 className="w-6 h-6 text-cyan-400" />,
    title: "Strategic Studio",
    desc: "Full-screen production mode with integrated Teleprompter, AI remixing, and direct exports.",
    category: "Studio"
  },
  {
    icon: <Globe className="w-6 h-6 text-amber-400" />,
    title: "Universal Webhooks",
    desc: "Connect to 6,000+ apps. Automate your workflow with Zapier, Make, or custom endpoints.",
    category: "Integrations"
  }
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-32 relative bg-white/[0.01]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">
              The Architecture <br /> of Impact.
            </h2>
            <p className="text-slate-400 text-xl font-light leading-relaxed">
              We didn&apos;t build another AI chatbot. We built a collaborative studio that handles the heavy lifting of content creation.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
             <Clock className="w-3.5 h-3.5" />
             <span>Built for 2026 Velocity</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {FEATURES.map((f, i) => (
            <div key={i} className="group relative p-10 rounded-[2.5rem] bg-black border border-white/5 hover:border-white/10 transition-all overflow-hidden">
               {/* Hover Gradient */}
               <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                     <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
                        {f.icon}
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-slate-400 transition-colors">
                        {f.category}
                     </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-light group-hover:text-slate-400 transition-colors">
                    {f.desc}
                  </p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
