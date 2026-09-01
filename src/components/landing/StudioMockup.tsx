'use client'

import { useState } from 'react'
import { 
  Share2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Play, 
  Layers, 
  Terminal, 
  SlidersHorizontal,
  RefreshCw,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabOption {
  id: string
  label: string
  pill: string
}

const TABS: TabOption[] = [
  { id: 'radar', label: 'Trend Signal Review', pill: 'Source Data' },
  { id: 'generator', label: 'AI Strategy Generator', pill: 'Neural Core' },
  { id: 'persona', label: 'Neural Brand Voice', pill: 'Zero Fluff' },
  { id: 'sync', label: 'Multi-Channel Sync', pill: '1-Click' },
]

export function StudioMockup() {
  const [activeTab, setActiveTab] = useState('radar')

  return (
    <div className="relative z-10 mx-auto mt-10 md:mt-14 w-full max-w-[1220px]">
      {/* Tab Switcher (ORCA style) */}
      <div className="mb-5 flex justify-center px-2">
        <div className="max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            role="tablist"
            aria-label="RepsBrief feature showcase"
            className="relative inline-flex min-w-max items-center gap-1 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            {TABS.map((tab) => {
              const isSelected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative inline-flex h-8 shrink-0 items-center gap-2 overflow-hidden rounded-[8px] px-3.5 text-[12.5px] font-medium tracking-tight transition-all duration-200 select-none cursor-pointer",
                    isSelected
                      ? "text-white shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                      : "text-white/45 hover:bg-white/[0.04] hover:text-white/70"
                  )}
                >
                  {isSelected && (
                    <span className="absolute inset-0 rounded-[8px] bg-white/[0.10] border border-white/[0.12]" />
                  )}
                  <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
                  <span className={cn(
                    "relative z-10 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider",
                    isSelected ? "bg-white/20 text-white" : "bg-white/5 text-white/30"
                  )}>
                    {tab.pill}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main ADE Desktop Container */}
      <div className="relative">
        {/* Ambient Top Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[10%] -top-10 bottom-6 rounded-[32px] bg-white/[0.035] blur-3xl"
        />

        {/* Outer Frame */}
        <div className="relative rounded-[14px] border border-white/[0.12] bg-[#030303]/95 p-1.5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.07),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/[0.04]">
          <div className="relative select-none overflow-hidden rounded-[10px] border border-white/[0.08] bg-[#090909] text-left text-[#fafafa] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.9)]">
            
            {/* Window Top Bar / Traffic Lights */}
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#111111] px-3.5">
              {/* Traffic Lights */}
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#ff5f57]/80 hover:bg-[#ff5f57] transition-colors" />
                <span className="size-3 rounded-full bg-[#ffbd2e]/80 hover:bg-[#ffbd2e] transition-colors" />
                <span className="size-3 rounded-full bg-[#28c840]/80 hover:bg-[#28c840] transition-colors" />
                <span className="ml-2 font-mono text-[11px] text-white/40 hidden sm:inline-block">
                  repsbrief-studio · main
                </span>
              </div>

              {/* Center URL / Branch Pill */}
              <div className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-black/60 px-3 py-1 text-[11px] font-mono text-white/70">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>niche: <strong className="text-white">fitness-nutrition-us</strong></span>
                <span className="text-white/30">|</span>
                <span className="text-white/50 text-[10px]">scrapers: 4 active</span>
              </div>

              {/* Top Right Quick Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] font-mono text-white/40 border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 rounded">
                  <span className="text-emerald-400">●</span>
                  <span className="hidden sm:inline">Engine OK</span>
                </div>
                <button type="button" className="p-1 rounded text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Split Panes Layout */}
            <div className="grid lg:grid-cols-12 min-h-[460px] text-[13px]">
              
              {/* Left Sidebar: Radar & Scraper Feeds */}
              <div className="lg:col-span-3 border-r border-white/[0.08] bg-[#0c0c0c] flex flex-col p-3.5 space-y-4">
                <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider px-1">
                  <span>Trend Ingestion</span>
                  <RefreshCw className="w-3 h-3 text-white/30 animate-spin-slow" />
                </div>

                {/* Scraper Sources */}
                <div className="space-y-1.5">
                  {[
                    { source: 'YouTube: Hypertrophy', metric: 'Video signal', color: 'text-red-400', active: true },
                    { source: 'RSS: Fitness research', metric: 'Article signal', color: 'text-amber-400', active: true },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md border text-[11.5px] transition-colors",
                        idx === 0
                          ? "border-white/[0.14] bg-white/[0.05] text-white"
                          : "border-white/[0.04] bg-white/[0.01] text-white/70 hover:bg-white/[0.03]"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={cn("text-xs", s.color)}>●</span>
                        <span className="truncate font-medium">{s.source}</span>
                      </div>
                      <span className="font-mono text-[10px] text-white/40 shrink-0">{s.metric}</span>
                    </div>
                  ))}
                </div>

                {/* Generated Ideas Queue */}
                <div className="pt-2 border-t border-white/[0.06] flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10.5px] font-mono text-white/40 uppercase tracking-wider px-1 block mb-2">
                      Brief Batch #409
                    </span>
                    <div className="space-y-1">
                      <div className="p-2 rounded bg-white/[0.08] border border-white/[0.10] text-[11.5px] font-medium text-white flex items-center justify-between">
                        <span className="truncate">1. The Zone 2 Cardio Trap</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">98% Viral</span>
                      </div>
                      <div className="p-2 rounded bg-transparent hover:bg-white/[0.02] text-[11.5px] text-white/50 flex items-center justify-between">
                        <span className="truncate">2. $5 High Protein Prep</span>
                        <span className="text-[9px] text-white/30 font-mono">Reel</span>
                      </div>
                      <div className="p-2 rounded bg-transparent hover:bg-white/[0.02] text-[11.5px] text-white/50 flex items-center justify-between">
                        <span className="truncate">3. Creatine Timing Myth</span>
                        <span className="text-[9px] text-white/30 font-mono">Thread</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 text-[10px] font-mono text-white/35 flex items-center justify-between px-1">
                    <span>20 Strategies Ready</span>
                    <span className="text-emerald-400">Ready to Ship</span>
                  </div>
                </div>
              </div>

              {/* Center Main Stage: Strategy & Script Diff Studio */}
              <div className="lg:col-span-6 border-r border-white/[0.08] bg-[#080808] flex flex-col">
                {/* Editor File Tabs */}
                <div className="flex items-center border-b border-white/[0.08] bg-[#0e0e0e] overflow-x-auto">
                  <div className="flex items-center gap-1.5 px-3 py-2 border-r border-white/[0.08] bg-[#080808] text-[11.5px] font-mono text-white">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Zone-2-Trap.brief.md</span>
                    <span className="ml-1 text-[9px] px-1 rounded bg-white/10 text-white/60">PRO</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 text-[11.5px] font-mono text-white/40 hover:text-white/70">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>brand-voice.config</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 text-[11.5px] font-mono text-white/40 hover:text-white/70">
                    <Layers className="w-3.5 h-3.5" />
                    <span>exports.json</span>
                  </div>
                </div>

                {/* Main Script Workspace Content */}
                <div className="p-5 flex-1 flex flex-col font-sans space-y-4 overflow-y-auto">
                  {/* Strategy Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                          Contrarian Reel Hook
                        </span>
                        <span className="text-white/30 text-xs">·</span>
                        <span className="text-white/40 text-[11px] font-mono">Format: 60s Short-Form Video</span>
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        &ldquo;Why 80% of Gym-Goers Do Zone 2 Cardio Completely Wrong&rdquo;
                      </h3>
                    </div>
                  </div>

                  {/* Hook & Retention Diff Box */}
                  <div className="rounded-lg border border-white/[0.08] bg-black/60 p-3.5 space-y-2.5 font-mono text-[11.5px]">
                    <div className="text-white/40 text-[10px] uppercase tracking-wider flex items-center justify-between">
                      <span>Neural Hook Generation (AB Test)</span>
                      <span className="text-emerald-400">Score: 9.6/10</span>
                    </div>
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-2">
                      <span className="text-rose-400 select-none">-</span>
                      <span>&quot;Zone 2 cardio is great for your heart and endurance.&quot; (Generic AI)</span>
                    </div>
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-2">
                      <span className="text-emerald-400 select-none">+</span>
                      <span>&quot;Stop jogging at 140 BPM. You aren&apos;t burning fat, you&apos;re just wasting time.&quot; (RepsBrief Neural)</span>
                    </div>
                  </div>

                  {/* 3-Act Script Breakdown */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-white/50 text-[10px] font-mono uppercase tracking-wider">
                      <span>Script Breakdown</span>
                      <span>Pacing: 148 WPM · 54s Total</span>
                    </div>
                    
                    <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] space-y-2 text-white/80">
                      <p><strong className="text-blue-400 font-mono text-[10px] uppercase">Act 1 (0-3s):</strong> <span className="italic text-white">&quot;Look at your smartwatch right now during your workout.&quot;</span> [Cut to high-contrast lactate graph overlay]</p>
                      <p><strong className="text-purple-400 font-mono text-[10px] uppercase">Act 2 (3-35s):</strong> Explain how crossing the aerobic threshold shifts fuel from lipid oxidation to glycogen depletion, ruining recovery without extra conditioning gains.</p>
                      <p><strong className="text-emerald-400 font-mono text-[10px] uppercase">Act 3 (35-50s):</strong> The simple &quot;Nasal Breathing Test&quot; to stay in the true fat-adaptation pocket every single session.</p>
                    </div>
                  </div>

                  {/* Source Evidence Citations */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-white/40">
                    <span className="text-white/60 font-semibold">Evidence Grounding:</span>
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-white/70">r/advancedfitness</span>
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-white/70">San-Millán 2020 Study</span>
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-emerald-400">100% Fact-Checked</span>
                  </div>
                </div>
              </div>

              {/* Right Panel: Delivery, Sync & Studio Controls */}
              <div className="lg:col-span-3 bg-[#0a0a0a] flex flex-col p-3.5 space-y-4">
                <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider px-1">
                  <span>Distribution & Sync</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>

                {/* Connected Channels */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center font-bold text-[10px]">N</div>
                      <div>
                        <div className="text-[11.5px] font-semibold text-white">Notion Database</div>
                        <div className="text-[10px] text-white/40 font-mono">Synced to /Content-Ops</div>
                      </div>
                    </div>
                    <span className="size-2 rounded-full bg-emerald-400" />
                  </div>

                  <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-[11.5px] font-semibold text-white">Google Calendar</div>
                        <div className="text-[10px] text-white/40 font-mono">Scheduled: Tomorrow 09:00</div>
                      </div>
                    </div>
                    <span className="size-2 rounded-full bg-blue-400" />
                  </div>

                  <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-[11.5px] font-semibold text-white">Public Share Link</div>
                        <div className="text-[10px] text-white/40 font-mono">repsbrief.com/s/9b12</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/40" />
                  </div>
                </div>

                {/* Teleprompter Quick Launch */}
                <div className="pt-2 border-t border-white/[0.06] flex-1 flex flex-col justify-between">
                  <div className="p-3 rounded-lg border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/60">
                      <span>Studio Teleprompter</span>
                      <span className="text-white/40">Ready</span>
                    </div>
                    <p className="text-[11.5px] text-white/80">
                      Fullscreen recording mode with auto-scroll and voice cadence matching.
                    </p>
                    <button
                      type="button"
                      className="w-full h-8 rounded-md bg-white text-black hover:bg-white/90 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-black" />
                      <span>Launch Teleprompter</span>
                    </button>
                  </div>

                  <div className="text-[10px] font-mono text-white/40 text-center pt-2">
                    ⚡ Auto-saves every keystroke
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
