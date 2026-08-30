'use client'

import { 
  Youtube, 
  Instagram, 
  Calendar, 
  Zap, 
  Globe, 
  Radio, 
  Share2, 
  MessageSquare,
  Flame
} from "lucide-react"

const LOGOS = [
  { name: 'YouTube', icon: Youtube, desc: 'Shorts & Long-form' },
  { name: 'Instagram', icon: Instagram, desc: 'Reels & Carousels' },
  { name: 'TikTok', icon: Flame, desc: 'Viral Sounds' },
  { name: 'Google Trends', icon: Globe, desc: 'Breakout Topics' },
  { name: 'Reddit Ingestion', icon: Radio, desc: 'Community Discussions' },
  { name: 'Notion Database', icon: Share2, desc: 'Content Hub' },
  { name: 'Google Calendar', icon: Calendar, desc: 'Auto Scheduling' },
  { name: 'Zapier & Make', icon: Zap, desc: '6,000+ App Sync' },
  { name: 'Slack & Discord', icon: MessageSquare, desc: 'Team Alerts' },
]

export function LogosMarquee() {
  return (
    <section className="relative border-y border-white/[0.06] bg-[#000000] py-14 md:py-20 overflow-hidden">
      {/* Top ambient highlight */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.02] to-transparent" />

      <div className="container relative mx-auto w-full px-4 text-center max-w-[1240px]">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-white/40">
          Integrated with the modern creator operating system
        </p>

        {/* Marquee Row with gradient edge mask */}
        <div className="relative mt-8 overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max animate-marquee gap-8 md:gap-12 select-none hover:[animation-play-state:paused]">
            {[...LOGOS, ...LOGOS].map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-colors cursor-default"
                >
                  <Icon className="w-4 h-4 text-white/60" />
                  <span className="font-sans font-medium text-xs text-white/80 whitespace-nowrap">
                    {item.name}
                  </span>
                  <span className="hidden sm:inline text-[10px] font-mono text-white/30">
                    · {item.desc}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

