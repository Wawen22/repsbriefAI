'use client'

import { 
  Radio, 
  BrainCircuit, 
  Users, 
  Calendar, 
  Play, 
  Workflow, 
  Sparkles
} from "lucide-react"

const FEATURES = [
  {
    icon: Radio,
    tag: "Data Pipeline",
    title: "Live Trend Radar & Scrapers",
    desc: "Scrapes Reddit discussions, Google Trends spikes, YouTube transcripts, and RSS feeds in real time to capture breakout topics before competitors.",
    badge: "Multi-Source",
    visual: (
      <div className="mt-4 p-3.5 rounded-xl border border-white/[0.08] bg-black/60 font-mono text-[11px] space-y-2">
        <div className="flex items-center justify-between text-white/50 text-[10px]">
          <span>FEED STREAM</span>
          <span className="text-emerald-400">● LIVE</span>
        </div>
        <div className="flex items-center justify-between text-white/80">
          <span>r/fitness · &quot;Zone 2 Threshold&quot;</span>
          <span className="text-orange-400">+340%</span>
        </div>
        <div className="flex items-center justify-between text-white/80">
          <span>Google Trends · &quot;Creatine Timing&quot;</span>
          <span className="text-blue-400">Breakout</span>
        </div>
      </div>
    )
  },
  {
    icon: BrainCircuit,
    tag: "Neural Persona",
    title: "AI Brand Voice Cloning",
    desc: "Train the AI on your past high-performing posts. Every hook, body transition, and CTA is written in your specific vocabulary and cadence — zero generic AI fluff.",
    badge: "Zero Robotic Tone",
    visual: (
      <div className="mt-4 p-3.5 rounded-xl border border-white/[0.08] bg-black/60 font-mono text-[11px] space-y-2">
        <div className="flex items-center justify-between text-white/50 text-[10px]">
          <span>VOICE INJECTION</span>
          <span className="text-purple-400">99.2% Match</span>
        </div>
        <div className="text-white/60 line-through text-[10.5px]">
          &quot;In this video I will discuss nutrition habits...&quot;
        </div>
        <div className="text-white font-medium text-[11px] text-emerald-300">
          &quot;Stop buying expensive greens powders. Here is the $5 fix...&quot;
        </div>
      </div>
    )
  },
  {
    icon: Users,
    tag: "Collaboration",
    title: "Multi-Player Workspaces & Approvals",
    desc: "Granular roles for Creators, Video Editors, and Agency Managers. Gated approval workflows prevent accidental publishing and keep output consistent.",
    badge: "Team-Ready",
    visual: (
      <div className="mt-4 p-3.5 rounded-xl border border-white/[0.08] bg-black/60 font-mono text-[11px] space-y-2">
        <div className="flex items-center justify-between text-white/50 text-[10px]">
          <span>ROLE ACCESS</span>
          <span className="text-blue-400">3 Members</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/80">Creator → Submits Draft</span>
          <span className="text-yellow-400 text-[10px]">Pending</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/80">Lead Editor → Review & Signoff</span>
          <span className="text-emerald-400 text-[10px]">Approved ✓</span>
        </div>
      </div>
    )
  },
  {
    icon: Calendar,
    tag: "Editorial Ops",
    title: "Unified Editorial Calendar",
    desc: "A centralized drag-and-drop calendar for Reels, TikToks, Shorts, and Threads. Instantly sync scheduled dates to your Google Calendar and Notion boards.",
    badge: "Auto-Sync",
    visual: (
      <div className="mt-4 p-3.5 rounded-xl border border-white/[0.08] bg-black/60 font-mono text-[11px] space-y-2">
        <div className="flex items-center justify-between text-white/50 text-[10px]">
          <span>TIMELINE SYNC</span>
          <span className="text-blue-400">Google Cal & Notion</span>
        </div>
        <div className="flex items-center justify-between text-white/80">
          <span>Tues: 3am Gym Myth (Reel)</span>
          <span className="text-white/40">09:00 AM</span>
        </div>
        <div className="flex items-center justify-between text-white/80">
          <span>Thurs: $5 Protein Haul (Post)</span>
          <span className="text-white/40">06:00 PM</span>
        </div>
      </div>
    )
  },
  {
    icon: Play,
    tag: "Studio Suite",
    title: "Strategic Studio & Teleprompter",
    desc: "Record videos without memorizing lines. Built-in fullscreen teleprompter tracks words per minute (WPM), line pauses, and visual camera cues.",
    badge: "Recording Mode",
    visual: (
      <div className="mt-4 p-3.5 rounded-xl border border-white/[0.08] bg-black/60 font-mono text-[11px] space-y-2">
        <div className="flex items-center justify-between text-white/50 text-[10px]">
          <span>PROMPTER ACTIVE</span>
          <span className="text-rose-400">REC ● 00:42</span>
        </div>
        <p className="text-white font-medium text-[11.5px] italic text-center py-1">
          &quot;[Pause for breath] Look at your smartwatch right now...&quot;
        </p>
      </div>
    )
  },
  {
    icon: Workflow,
    tag: "Ecosystem",
    title: "Universal Webhooks & API",
    desc: "Connect RepsBrief to 6,000+ tools with Zapier, Make, and signed HMAC webhooks. Send notifications to Slack and Discord the second a brief is generated.",
    badge: "6,000+ Integrations",
    visual: (
      <div className="mt-4 p-3.5 rounded-xl border border-white/[0.08] bg-black/60 font-mono text-[11px] space-y-2">
        <div className="flex items-center justify-between text-white/50 text-[10px]">
          <span>WEBHOOK DISPATCH</span>
          <span className="text-emerald-400">200 OK</span>
        </div>
        <div className="flex items-center justify-between text-white/80">
          <span>POST /api/webhooks/zapier</span>
          <span className="text-white/40">12ms</span>
        </div>
        <div className="flex items-center justify-between text-white/80">
          <span>POST /api/slack/broadcast</span>
          <span className="text-white/40">8ms</span>
        </div>
      </div>
    )
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 md:py-32 relative bg-[#000000] border-b border-white/[0.06]">
      <div className="container px-4 mx-auto max-w-[1240px]">
        {/* Section Header */}
        <div className="mb-16 md:mb-20 text-left max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/[0.10] bg-white/[0.03] text-white/70 text-[11px] font-mono uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Architecture of Impact</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-5 leading-tight">
            Agent-first, end to end.
          </h2>
          <p className="text-white/50 text-base sm:text-xl font-sans leading-relaxed">
            Generic chatbots give you generic advice. RepsBrief is an end-to-end development environment for trend research, script writing, team approval, and multi-channel delivery.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="group relative rounded-2xl border border-white/[0.08] bg-[#070707] p-7 md:p-8 hover:border-white/[0.18] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
              >
                {/* Subtle Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  {/* Top Icon & Category */}
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-lg border border-white/[0.10] bg-white/[0.04] flex items-center justify-center text-white group-hover:scale-105 group-hover:border-white/20 transition-all">
                      <Icon className="w-5 h-5 text-white/90" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/40 border border-white/[0.06] bg-white/[0.02] px-2 py-0.5 rounded">
                      {f.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-blue-300 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-white/55 text-xs sm:text-[13px] leading-relaxed font-sans">
                      {f.desc}
                    </p>
                  </div>
                </div>

                {/* Interactive Visual Preview Box */}
                <div className="relative z-10 pt-4">
                  {f.visual}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
