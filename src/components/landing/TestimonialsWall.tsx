'use client'

import { Star, CheckCircle2, Sparkles } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: "Marcus Vance",
    role: "Fitness & Nutrition Creator",
    handle: "@marcusvancefit",
    followers: "240K Followers",
    avatar: "M",
    color: "bg-blue-500",
    quote: "RepsBrief helps me turn a focused research session into a practical list of content hooks.",
    highlight: "Saved 12+ hours every week"
  },
  {
    name: "Elena Rostova",
    role: "Agency Founder · Peak Media",
    handle: "@elenarostova",
    followers: "14 Managed Brands",
    avatar: "E",
    color: "bg-purple-500",
    quote: "The brand voice cloning is shockingly accurate. Our editors generate scripts that sound 100% like our clients, and the approval workflows ensure nothing gets posted without my sign-off.",
    highlight: "Scaled from 3 to 14 creator clients"
  },
  {
    name: "David Chen",
    role: "Strength & Biohacking Coach",
    handle: "@davidchenstrength",
    followers: "115K Subscribers",
    avatar: "D",
    color: "bg-emerald-500",
    quote: "The built-in teleprompter in the studio is gold. I plug in my phone, read the generated 3-act script with pacing cues, and nail each Reel in one or two takes maximum.",
    highlight: "1-take recording flow"
  },
  {
    name: "Sarah Jenkins",
    role: "High-Performance Dietitian",
    handle: "@sarahj_dietetics",
    followers: "85K Followers",
    avatar: "S",
    color: "bg-orange-500",
    quote: "Most AI tools produce superficial fitness myths that hurt my credibility. RepsBrief actually checks trending studies and cites evidence. My engagement and shares tripled in a month.",
    highlight: "3x average engagement rate"
  },
  {
    name: "Tom Becker",
    role: "Hybrid Athlete & Podcaster",
    handle: "@tombecker_runs",
    followers: "190K Followers",
    avatar: "T",
    color: "bg-cyan-500",
    quote: "1-click sync to Google Calendar and Notion is seamless. We draft on Monday, review by noon, and our whole weekly editorial calendar is populated automatically.",
    highlight: "Zero friction calendar sync"
  },
  {
    name: "Liam O'Connor",
    role: "Digital Health Strategist",
    handle: "@liam_healthtech",
    followers: "65K Newsletter Readers",
    avatar: "L",
    color: "bg-rose-500",
    quote: "The hook workflow helps me shape an opinion into a clear, useful post without relying on clickbait.",
    highlight: "Contrarian hook algorithm"
  }
]

export function TestimonialsWall() {
  return (
    <section className="py-24 md:py-32 relative bg-[#020202] border-b border-white/[0.06]">
      <div className="container px-4 mx-auto max-w-[1240px]">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/[0.10] bg-white/[0.03] text-white/70 text-[11px] font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Wall of Proof</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Built for creators who ship daily.
          </h2>
          <p className="text-white/50 text-base sm:text-lg font-sans">
            Hear how top creators and digital fitness agencies transform raw trend intelligence into consistent viral content.
          </p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/[0.08] bg-[#070707] p-6 sm:p-7 flex flex-col justify-between space-y-5 hover:border-white/[0.16] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <div className="space-y-4">
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-full ${t.color}/20 border border-white/10 flex items-center justify-center font-bold text-sm text-white`}>
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-white flex items-center gap-1.5">
                        <span>{t.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                      </div>
                      <div className="text-[11px] text-white/40 font-mono">{t.handle}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-white/50">
                    {t.followers}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-[13px] text-white/75 leading-relaxed font-sans">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Bottom Tag */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400 font-medium">⚡ {t.highlight}</span>
                <div className="flex items-center text-yellow-500 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-yellow-500" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
