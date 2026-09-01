'use client'

import { CheckCircle2, Smartphone, ArrowRight, Play } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function MobileSpotlight() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-[#020202] border-b border-white/[0.06]">
      <div className="container px-4 mx-auto max-w-[1240px]">
        <div className="grid gap-10 lg:grid-cols-12 items-center rounded-2xl border border-white/[0.08] bg-[#070707] p-8 md:p-12 relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-3xl pointer-events-none" />

          {/* Left Column: Copy & Benefits */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/[0.10] bg-white/[0.03] text-white/70 text-[11px] font-mono uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>Mobile Companion & Studio</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Review and record scripts on the go.
            </h2>

            <p className="text-white/55 text-base sm:text-lg font-sans leading-relaxed max-w-xl">
              Don&apos;t wait until you&apos;re in front of your desktop. Read the fresh morning brief on your phone, approve scripts with your team, and record directly using the built-in mobile teleprompter.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'Generate a fresh trend brief from any device',
                '1-tap script approvals for editors and creators',
                'Full-screen mobile teleprompter with auto-scroll and pace control',
                'Instant push to Notion and Google Calendar'
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-white/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                className="h-10 px-5 rounded-md bg-white text-black hover:bg-white/90 text-xs font-medium tracking-tight shadow-sm cursor-pointer"
                asChild
              >
                <Link href="/signup">
                  <span>Start Free on Mobile & Web</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
              <span className="text-xs font-mono text-white/40">
                PWA / Responsive Web
              </span>
            </div>
          </div>

          {/* Right Column: Sleek Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-[280px] sm:w-[310px] rounded-[36px] border-[5px] border-[#222222] bg-[#0c0c0c] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
              {/* Phone Speaker & Dynamic Island */}
              <div className="mx-auto mb-3 h-4 w-24 rounded-full bg-[#181818] flex items-center justify-center">
                <div className="size-2 rounded-full bg-black mr-2" />
                <div className="h-1.5 w-8 rounded-full bg-black/60" />
              </div>

              {/* Inside Phone Screen */}
              <div className="space-y-3 rounded-[24px] bg-[#050505] p-4 border border-white/[0.06] text-left">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-6 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] text-blue-400">
                      RB
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Daily Brief #128</div>
                      <div className="text-[9px] font-mono text-white/40">Fitness · 20 Trends</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300">Live</span>
                </div>

                {/* Card 1 */}
                <div className="rounded-xl border border-white/[0.08] bg-[#111111] p-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-blue-400">
                    <span>Reel #1 · 98% Score</span>
                    <span className="text-white/40">52s</span>
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">
                    &ldquo;The 3am Gym Myth (Backed by Sleep Lab Data)&rdquo;
                  </h4>
                  <div className="flex items-center justify-between pt-1">
                    <button className="h-6 px-2.5 rounded bg-white text-black text-[10px] font-medium flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-black" /> Prompter
                    </button>
                    <span className="text-[10px] font-mono text-emerald-400">Approved ✓</span>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="rounded-xl border border-white/[0.06] bg-[#0d0d0d] p-3 space-y-1.5 opacity-70">
                  <div className="text-[9px] font-mono text-white/40">Carousel #2 · Nutrition</div>
                  <div className="text-[11px] font-semibold text-white truncate">
                    $5 High-Protein Grocery Haul (Lidl Edition)
                  </div>
                </div>

                {/* Quick 1-Tap Sync Bar */}
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-white/60 font-mono text-[10px]">Sync to Notion</span>
                  <button className="h-5 px-2 rounded bg-blue-600 text-white text-[9px] font-medium">
                    Push
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
