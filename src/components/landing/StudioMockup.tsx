'use client'

import { useState, useEffect } from 'react'
import { 
  Share2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Play, 
  Pause,
  Terminal, 
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Flame,
  Radio,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabOption {
  id: 'radar' | 'generator' | 'persona' | 'sync'
  label: string
  pill: string
}

const TABS: TabOption[] = [
  { id: 'radar', label: 'Trend Signal Review', pill: 'Source Data' },
  { id: 'generator', label: 'AI Strategy Generator', pill: 'Neural Core' },
  { id: 'persona', label: 'Neural Brand Voice', pill: 'Zero Fluff' },
  { id: 'sync', label: 'Multi-Channel Sync', pill: '1-Click' },
]

// Signals for Tab 1
const SIGNALS = [
  {
    id: 'zone2',
    title: 'Zone 2 Cardio Paradox & Lactate Dynamics',
    source: 'YouTube + PubMed Ingestion',
    velocity: '+420% Velocity',
    virality: '98%',
    category: 'Cardio & Bio-energetics',
    summary: 'High-performing creators debunking standard 140 BPM heart rate targets; aerobic threshold shifts to glycogen burn when pacing is off.',
    painPoint: 'Lifters wasting 45 mins doing cardio too fast, killing recovery.',
    citations: ['San-Millán 2020 Study (PubMed #32109)', 'r/advancedfitness meta-analysis', 'Dr. Inigo San-Millan lab protocol'],
    angles: [
      'The 140 BPM Fallacy: Why your smartwatch estimate is wrong',
      'The Nasal Breathing Test: $0 lactate threshold metric',
      'Why cardio after leg day impairs mTOR phosphorylation'
    ]
  },
  {
    id: 'coldplunge',
    title: 'Cold Plunge Post-Hypertrophy Blunting',
    source: 'RSS Sports Sci + Podcasts',
    velocity: '+280% Velocity',
    virality: '94%',
    category: 'Recovery & Muscle Growth',
    summary: 'New meta-analysis showing ice baths within 4 hours post-lifting blunt hypertrophy by suppressing inflammatory signalling cascades.',
    painPoint: 'Gym-goers freezing themselves thinking it accelerates muscle growth.',
    citations: ['Roberts et al. 2015 Journal of Physiology', 'Peake et al. 2017 Hypertrophy Review'],
    angles: [
      'The Ice Bath Trap: How cold water cuts gains by 20%',
      'When cold exposure actually works: Morning vs Post-lift',
      'Contrast therapy protocol for central nervous recovery'
    ]
  },
  {
    id: 'creatine',
    title: 'Creatine Timing & Carbohydrate Partitioning',
    source: 'PubMed Ingestion Feed',
    velocity: '+190% Velocity',
    virality: '91%',
    category: 'Nutrient Timing',
    summary: 'Insulin-mediated creatine uptake is 60% higher when paired with fast-digesting carbohydrates immediately post-workout.',
    painPoint: 'Inconsistent dosing and dry-scooping without insulin co-transport.',
    citations: ['Antonio & Ciccone 2013 JISSN', 'Kreider et al. 2017 Position Stand'],
    angles: [
      'Stop dry-scooping: The insulin receptor mechanism',
      'Pre vs Post workout: What 12 randomized trials proved',
      'Hydration cofactor: The intracellular water retention metric'
    ]
  },
]

// Hooks for Tab 2
const HOOK_VARIANTS = {
  a: {
    label: 'Hook A (Contrarian)',
    tag: 'Contrarian Pattern Interrupt',
    text: '"Stop jogging at 140 BPM. You aren\'t burning fat, you\'re just wasting time."',
    score: '9.8/10',
    why: 'Challenges conventional wisdom immediately, arresting scroll within 1.2 seconds.'
  },
  b: {
    label: 'Hook B (Curiosity Gap)',
    tag: 'The $0 Diagnostic',
    text: '"The $0 nasal test cardiologists use to spot fake Zone 2 training in 10 seconds."',
    score: '9.4/10',
    why: 'Provides an immediate actionable hook with zero equipment barrier.'
  },
  c: {
    label: 'Hook C (Loss Aversion)',
    tag: 'Recovery Callout',
    text: '"If you do cardio right after leg day, you\'re cancelling out 40% of your recovery."',
    score: '9.6/10',
    why: 'Triggers intense loss aversion for dedicated lifters guarding their muscle gains.'
  }
}

// Brand Archetypes for Tab 3
const ARCHETYPES = {
  contrarian: {
    name: 'Contrarian Scientist',
    dna: 'Sharp, peer-reviewed, high-energy, uncompromising on evidence.',
    generic: '"In this comprehensive guide, we will dive deep into the fascinating benefits of Zone 2 cardio. It is truly a game-changer that unlocks your fat-burning potential!"',
    repsbrief: '"Most people ruin their Zone 2 cardio within 4 minutes. If you can\'t speak a full sentence through your nose without gasping, you\'re burning glycogen, not fat. Here is the 10-second fix."',
    fluffEliminated: 4,
    brevity: '9.2 words/sentence'
  },
  coach: {
    name: 'No-BS Performance Coach',
    dna: 'Direct, raw intensity, zero fitness excuses, hyper-actionable.',
    generic: '"Cardio is a wonderful journey for your wellness. Remember to always listen to your body and unlock your true potential every day."',
    repsbrief: '"Put down the smartphone on the treadmill. If your heart rate spikes into Zone 3, you just turned a recovery session into junk volume. Slow down and get the work done right."',
    fluffEliminated: 5,
    brevity: '8.4 words/sentence'
  },
  educator: {
    name: 'Clinical Deep-Dive Educator',
    dna: 'Calm authority, step-by-step mechanisms, visual breakdowns.',
    generic: '"Let\'s dive into the fascinating world of mitochondrial biogenesis and discover the secrets behind aerobic respiration."',
    repsbrief: '"Mitochondria don\'t care about your subjective effort. The moment blood lactate exceeds 2.0 mmol/L, fat oxidation drops by 70%. Here is the exact curve."',
    fluffEliminated: 3,
    brevity: '11.0 words/sentence'
  }
}

export function StudioMockup() {
  const [activeTab, setActiveTab] = useState<'radar' | 'generator' | 'persona' | 'sync'>('radar')
  
  // Tab 1: Radar State
  const [selectedSignalId, setSelectedSignalId] = useState('zone2')
  
  // Tab 2: Generator State
  const [selectedFormat, setSelectedFormat] = useState<'reel' | 'carousel' | 'thread'>('reel')
  const [selectedHookKey, setSelectedHookKey] = useState<'a' | 'b' | 'c'>('a')
  
  // Tab 3: Persona State
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<'contrarian' | 'coach' | 'educator'>('contrarian')
  const [voiceViewMode, setVoiceViewMode] = useState<'compare' | 'final'>('compare')
  
  // Tab 4: Sync State
  const [isCopied, setIsCopied] = useState(false)
  const [isSyncingNotion, setIsSyncingNotion] = useState(false)
  const [notionSynced, setNotionSynced] = useState(true)
  const [isPlayingPrompter, setIsPlayingPrompter] = useState(false)
  const [prompterLineIndex, setPrompterLineIndex] = useState(0)

  // Prompter auto-play simulation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlayingPrompter) {
      interval = setInterval(() => {
        setPrompterLineIndex((prev) => (prev + 1) % 4)
      }, 2200)
    }
    return () => clearInterval(interval)
  }, [isPlayingPrompter])

  const selectedSignal = SIGNALS.find(s => s.id === selectedSignalId) || SIGNALS[0]
  const currentHook = HOOK_VARIANTS[selectedHookKey]
  const currentArchetype = ARCHETYPES[selectedArchetypeKey]

  const handleCopyLink = () => {
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleNotionSync = () => {
    setIsSyncingNotion(true)
    setNotionSynced(false)
    setTimeout(() => {
      setIsSyncingNotion(false)
      setNotionSynced(true)
    }, 1200)
  }

  return (
    <div className="relative z-10 mx-auto mt-10 md:mt-14 w-full max-w-[1220px]">
      {/* Tab Switcher */}
      <div className="mb-5 flex justify-center px-2">
        <div className="max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div
            role="tablist"
            aria-label="RepsBrief interactive studio showcase"
            className="relative inline-flex min-w-max items-center gap-1 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md"
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
                    "relative z-10 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider transition-colors",
                    isSelected ? "bg-white/20 text-white font-semibold" : "bg-white/5 text-white/30"
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
                <span className="size-3 rounded-full bg-[#ff5f57]/80 hover:bg-[#ff5f57] transition-colors cursor-pointer" />
                <span className="size-3 rounded-full bg-[#ffbd2e]/80 hover:bg-[#ffbd2e] transition-colors cursor-pointer" />
                <span className="size-3 rounded-full bg-[#28c840]/80 hover:bg-[#28c840] transition-colors cursor-pointer" />
                <span className="ml-2 font-mono text-[11px] text-white/40 hidden sm:inline-block">
                  repsbrief-studio · {activeTab}.view
                </span>
              </div>

              {/* Center URL / Branch Pill */}
              <div className="flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-black/60 px-3 py-1 text-[11px] font-mono text-white/70">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>niche: <strong className="text-white">fitness-nutrition-us</strong></span>
                <span className="text-white/30 hidden sm:inline">|</span>
                <span className="text-white/50 text-[10px] hidden sm:inline">
                  {activeTab === 'radar' && 'radar: 3 signals active'}
                  {activeTab === 'generator' && 'engine: neural v2.0'}
                  {activeTab === 'persona' && 'voice: 99.4% match'}
                  {activeTab === 'sync' && 'distribution: 3 live channels'}
                </span>
              </div>

              {/* Top Right Quick Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/40 border border-white/[0.08] bg-white/[0.02] px-2.5 py-0.5 rounded">
                  <span className="text-emerald-400">●</span>
                  <span className="hidden sm:inline font-medium text-white/70">Engine Live</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    const tabOrder: Array<'radar' | 'generator' | 'persona' | 'sync'> = ['radar', 'generator', 'persona', 'sync']
                    const nextIdx = (tabOrder.indexOf(activeTab) + 1) % tabOrder.length
                    setActiveTab(tabOrder[nextIdx])
                  }}
                  className="p-1 rounded text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Next View"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* TAB 1: RADAR VIEW */}
            {activeTab === 'radar' && (
              <div className="grid lg:grid-cols-12 min-h-[470px] text-[13px] animate-in fade-in duration-200">
                {/* Left Column: Scraper Feed List */}
                <div className="lg:col-span-4 border-r border-white/[0.08] bg-[#0c0c0c] flex flex-col p-3.5 space-y-3.5">
                  <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider px-1">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-red-400" />
                      Live Trend Ingestion
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">3 New</span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {SIGNALS.map((sig) => {
                      const isSelected = selectedSignalId === sig.id
                      return (
                        <button
                          key={sig.id}
                          type="button"
                          onClick={() => setSelectedSignalId(sig.id)}
                          className={cn(
                            "w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer relative",
                            isSelected
                              ? "border-white/[0.18] bg-white/[0.06] text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                              : "border-white/[0.04] bg-white/[0.01] text-white/60 hover:bg-white/[0.03] hover:text-white/80"
                          )}
                        >
                          {isSelected && (
                            <span className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-400 rounded-r" />
                          )}
                          <div className="flex items-center justify-between mb-1 pl-1">
                            <span className="text-[10px] font-mono text-white/40 truncate">{sig.source}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                              {sig.velocity}
                            </span>
                          </div>
                          <div className="font-semibold text-[12px] text-white leading-snug pl-1 truncate">
                            {sig.title}
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/[0.04] text-[10px] font-mono text-white/40 pl-1">
                            <span>Virality: <strong className="text-emerald-400">{sig.virality}</strong></span>
                            <span className="text-white/50">{sig.category}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Scraper Status Bar */}
                  <div className="pt-3 border-t border-white/[0.06] text-[10px] font-mono text-white/40 flex items-center justify-between px-1">
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      YouTube + RSS Active
                    </span>
                    <span>Zero Stale Filter ✓</span>
                  </div>
                </div>

                {/* Center Column: Signal Inspector */}
                <div className="lg:col-span-5 border-r border-white/[0.08] bg-[#080808] flex flex-col p-5 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-400" />
                        High-Confidence Signal
                      </span>
                      <span className="text-white/30 text-xs">·</span>
                      <span className="text-white/50 text-[11px] font-mono">Virality Index: {selectedSignal.virality}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {selectedSignal.title}
                    </h3>
                  </div>

                  {/* Signal Summary & Pain Point */}
                  <div className="rounded-lg border border-white/[0.08] bg-black/60 p-3.5 space-y-2 text-xs">
                    <div className="text-white/40 font-mono text-[10px] uppercase tracking-wider">
                      Signal Synthesis
                    </div>
                    <p className="text-white/80 leading-relaxed font-sans">
                      {selectedSignal.summary}
                    </p>
                    <div className="pt-1.5 border-t border-white/[0.06] text-[11px] text-amber-300/90 font-mono flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold shrink-0">PAIN POINT:</span>
                      <span>{selectedSignal.painPoint}</span>
                    </div>
                  </div>

                  {/* Extracted Creator Angles */}
                  <div className="space-y-2 text-xs">
                    <div className="text-white/40 font-mono text-[10px] uppercase tracking-wider flex items-center justify-between">
                      <span>Extracted Content Angles</span>
                      <span className="text-emerald-400 font-mono">3 Contrarian Angles</span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedSignal.angles.map((angle, idx) => (
                        <div key={idx} className="p-2 rounded bg-white/[0.03] border border-white/[0.06] text-white/85 text-[11.5px] flex items-center gap-2">
                          <span className="font-mono text-[10px] text-blue-400 font-bold">{idx + 1}.</span>
                          <span className="truncate">{angle}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grounded Citations */}
                  <div className="pt-2 border-t border-white/[0.06] flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-white/40">
                    <span className="text-white/60 font-semibold">Evidence Citations:</span>
                    {selectedSignal.citations.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-white/70">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Column: Compilation Action & Stats */}
                <div className="lg:col-span-3 bg-[#0a0a0a] flex flex-col p-4 space-y-4 justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider px-1">
                      <span>Signal Radar Stats</span>
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-1">
                        <div className="text-[10px] font-mono text-white/40 uppercase">Search Spike</div>
                        <div className="text-lg font-bold text-emerald-400 font-mono">+310% 7-Day</div>
                        <div className="text-[10.5px] text-white/50">48.2k discussions analyzed</div>
                      </div>

                      <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-1">
                        <div className="text-[10px] font-mono text-white/40 uppercase">Noise Filter Ratio</div>
                        <div className="text-lg font-bold text-white font-mono">88% Filtered</div>
                        <div className="text-[10.5px] text-white/50">Generic reposts eliminated</div>
                      </div>
                    </div>
                  </div>

                  {/* Transition to Generator CTA */}
                  <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 space-y-2">
                    <div className="text-[11px] font-medium text-blue-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Ready to Build Brief
                    </div>
                    <p className="text-[11px] text-white/60">
                      Convert this signal into a full 3-Act script with Brand Voice.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('generator')}
                      className="w-full h-8 rounded-md bg-white text-black hover:bg-white/90 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Generate Strategy</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GENERATOR VIEW */}
            {activeTab === 'generator' && (
              <div className="grid lg:grid-cols-12 min-h-[470px] text-[13px] animate-in fade-in duration-200">
                {/* Left Column: Format & Queue */}
                <div className="lg:col-span-3 border-r border-white/[0.08] bg-[#0c0c0c] flex flex-col p-3.5 space-y-4">
                  <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider px-1">
                    <span>Brief Batch #409</span>
                    <span className="text-[10px] font-mono text-emerald-400">PRO Plan</span>
                  </div>

                  {/* Format Selector Pills */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-white/40 uppercase px-1">Target Format</div>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'reel' as const, label: 'Reel/Short', duration: '60s' },
                        { id: 'carousel' as const, label: 'Carousel', duration: '10 Slides' },
                        { id: 'thread' as const, label: 'Thread', duration: '7 Posts' },
                      ].map((fmt) => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setSelectedFormat(fmt.id)}
                          className={cn(
                            "py-1.5 px-1 rounded text-center text-[10px] font-mono border transition-all cursor-pointer",
                            selectedFormat === fmt.id
                              ? "border-blue-500/40 bg-blue-500/10 text-white font-bold"
                              : "border-white/[0.04] bg-white/[0.01] text-white/40 hover:bg-white/[0.03] hover:text-white/70"
                          )}
                        >
                          <div>{fmt.label}</div>
                          <div className="text-[8.5px] text-white/30">{fmt.duration}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ideas Queue */}
                  <div className="pt-2 border-t border-white/[0.06] flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10.5px] font-mono text-white/40 uppercase tracking-wider px-1 block mb-2">
                        Generated Strategies
                      </span>
                      <div className="space-y-1.5">
                        <div className="p-2 rounded bg-white/[0.08] border border-white/[0.12] text-[11.5px] font-medium text-white flex items-center justify-between">
                          <span className="truncate">1. Zone 2 Cardio Paradox</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">98% Viral</span>
                        </div>
                        <div className="p-2 rounded bg-transparent hover:bg-white/[0.02] text-[11.5px] text-white/50 flex items-center justify-between cursor-pointer">
                          <span className="truncate">2. Cold Plunge Timing</span>
                          <span className="text-[9px] text-white/30 font-mono">94%</span>
                        </div>
                        <div className="p-2 rounded bg-transparent hover:bg-white/[0.02] text-[11.5px] text-white/50 flex items-center justify-between cursor-pointer">
                          <span className="truncate">3. Creatine Partitioning</span>
                          <span className="text-[9px] text-white/30 font-mono">91%</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 text-[10px] font-mono text-white/35 flex items-center justify-between px-1">
                      <span>20 Strategies In Batch</span>
                      <span className="text-emerald-400">All Fact-Checked</span>
                    </div>
                  </div>
                </div>

                {/* Center Column: Strategy & Script Diff Studio */}
                <div className="lg:col-span-6 border-r border-white/[0.08] bg-[#080808] flex flex-col">
                  {/* File Tabs */}
                  <div className="flex items-center border-b border-white/[0.08] bg-[#0e0e0e] px-2 overflow-x-auto">
                    <div className="flex items-center gap-1.5 px-3 py-2 border-r border-white/[0.08] bg-[#080808] text-[11.5px] font-mono text-white">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span>Zone-2-Trap.brief.md</span>
                      <span className="ml-1 text-[9px] px-1 rounded bg-white/10 text-white/60">PRO</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-2 text-[11.5px] font-mono text-white/40 hover:text-white/70">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>brand-voice.config</span>
                    </div>
                  </div>

                  {/* Main Script Workspace Content */}
                  <div className="p-5 flex-1 flex flex-col font-sans space-y-3.5 overflow-y-auto max-h-[410px]">
                    {/* Strategy Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                          {selectedFormat === 'reel' && '60s Short-Form Reel'}
                          {selectedFormat === 'carousel' && '10-Slide Carousel Blueprint'}
                          {selectedFormat === 'thread' && '7-Post High-Authority Thread'}
                        </span>
                        <span className="text-white/30 text-xs">·</span>
                        <span className="text-white/40 text-[11px] font-mono">Pacing: 148 WPM · 54s Total</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        &ldquo;Why 80% of Gym-Goers Do Zone 2 Cardio Completely Wrong&rdquo;
                      </h3>
                    </div>

                    {/* Interactive Hook Selector */}
                    <div className="rounded-lg border border-white/[0.08] bg-black/60 p-3.5 space-y-2.5 font-mono text-[11.5px]">
                      <div className="text-white/40 text-[10px] uppercase tracking-wider flex items-center justify-between">
                        <span>Interactive Hook A/B Test</span>
                        <span className="text-emerald-400">Score: {currentHook.score}</span>
                      </div>

                      {/* Hook Selector Pills */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['a', 'b', 'c'] as const).map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedHookKey(key)}
                            className={cn(
                              "px-2 py-1 rounded text-center text-[10.5px] border transition-all cursor-pointer font-mono",
                              selectedHookKey === key
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold"
                                : "border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.05]"
                            )}
                          >
                            {HOOK_VARIANTS[key].label}
                          </button>
                        ))}
                      </div>

                      {/* Active Hook Diff */}
                      <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-2">
                        <span className="text-emerald-400 select-none font-bold">+</span>
                        <span className="font-sans text-xs">{currentHook.text}</span>
                      </div>
                      <div className="text-[10px] text-white/40 italic font-mono">
                        💡 {currentHook.why}
                      </div>
                    </div>

                    {/* 3-Act Script Breakdown */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-white/50 text-[10px] font-mono uppercase tracking-wider">
                        <span>Script Breakdown</span>
                        <span>135 Words · 3 Beats</span>
                      </div>
                      
                      <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] space-y-2 text-white/80">
                        <p><strong className="text-blue-400 font-mono text-[10px] uppercase">Act 1 (0-3s):</strong> <span className="italic text-white">&quot;Look at your smartwatch right now during your workout.&quot;</span> [Cut to high-contrast lactate graph overlay]</p>
                        <p><strong className="text-purple-400 font-mono text-[10px] uppercase">Act 2 (3-35s):</strong> Explain how crossing the aerobic threshold shifts fuel from lipid oxidation to glycogen depletion, ruining recovery without extra conditioning gains.</p>
                        <p><strong className="text-emerald-400 font-mono text-[10px] uppercase">Act 3 (35-50s):</strong> The simple &quot;Nasal Breathing Test&quot; to stay in the true fat-adaptation pocket every single session.</p>
                      </div>
                    </div>

                    {/* Citations */}
                    <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] font-mono text-white/40">
                      <span className="text-white/60 font-semibold">Evidence Grounding:</span>
                      <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-white/70">San-Millán 2020</span>
                      <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-emerald-400">100% Fact-Checked</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Controls & Actions */}
                <div className="lg:col-span-3 bg-[#0a0a0a] flex flex-col p-3.5 space-y-4 justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider px-1">
                      <span>Studio Actions</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>

                    <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-2">
                      <div className="text-[11px] font-mono text-white/60">Voice DNA Profile</div>
                      <div className="flex items-center justify-between text-xs font-semibold text-white">
                        <span>Contrarian Coach</span>
                        <span className="text-purple-400 font-mono text-[10px]">99.4% Match</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('persona')}
                        className="w-full py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[10.5px] font-mono text-white/70 transition-colors border border-white/[0.06] cursor-pointer"
                      >
                        Edit Brand Voice →
                      </button>
                    </div>

                    <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-2">
                      <div className="text-[11px] font-mono text-white/60">Distribution Hub</div>
                      <div className="text-[11px] text-white/80">
                        Notion, Calendar & Public link ready.
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('sync')}
                        className="w-full py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[10.5px] font-mono text-white/70 transition-colors border border-white/[0.06] cursor-pointer"
                      >
                        Open 1-Click Sync →
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-white/40 text-center pt-2">
                    ⚡ Auto-saves every keystroke
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NEURAL BRAND VOICE VIEW */}
            {activeTab === 'persona' && (
              <div className="grid lg:grid-cols-12 min-h-[470px] text-[13px] animate-in fade-in duration-200">
                {/* Left Column: Archetype Selector & Fluff Blacklist */}
                <div className="lg:col-span-4 border-r border-white/[0.08] bg-[#0c0c0c] flex flex-col p-3.5 space-y-4">
                  <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider px-1">
                    <span className="flex items-center gap-1.5">
                      <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                      Voice DNA Engine
                    </span>
                    <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">Active</span>
                  </div>

                  {/* Archetype Selector */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono text-white/40 uppercase px-1">Select Persona Archetype</div>
                    {(Object.keys(ARCHETYPES) as Array<keyof typeof ARCHETYPES>).map((key) => {
                      const arch = ARCHETYPES[key]
                      const isSelected = selectedArchetypeKey === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedArchetypeKey(key)}
                          className={cn(
                            "w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer",
                            isSelected
                              ? "border-purple-500/40 bg-purple-500/10 text-white shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
                              : "border-white/[0.04] bg-white/[0.01] text-white/60 hover:bg-white/[0.03]"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-white">{arch.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                          </div>
                          <p className="text-[10px] text-white/40 mt-1 font-sans line-clamp-1">{arch.dna}</p>
                        </button>
                      )
                    })}
                  </div>

                  {/* Zero Fluff Blacklist Box */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    <div className="text-[10.5px] font-mono text-white/40 uppercase tracking-wider px-1 flex items-center justify-between">
                      <span>Zero-Fluff Blacklist</span>
                      <span className="text-rose-400 text-[10px] font-mono">Blocked</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['"game-changer"', '"dive deep into"', '"unlock potential"', '"in this video"'].map((badWord, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 line-through text-[10px] font-mono">
                          {badWord}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-white/40 flex items-center justify-between px-1">
                    <span>Target Cadence:</span>
                    <span className="text-emerald-400 font-bold">{currentArchetype.brevity}</span>
                  </div>
                </div>

                {/* Center Column: Live Voice Rewrite Diff */}
                <div className="lg:col-span-5 border-r border-white/[0.08] bg-[#080808] flex flex-col p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                          Neural Voice Injection
                        </span>
                        <span className="text-white/30 text-xs">·</span>
                        <span className="text-white/50 text-[11px] font-mono">{currentArchetype.name}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        AI Output vs Your True Voice
                      </h3>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex rounded-md border border-white/[0.08] bg-black/40 p-0.5 text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => setVoiceViewMode('compare')}
                        className={cn(
                          "px-2 py-0.5 rounded transition-all cursor-pointer",
                          voiceViewMode === 'compare' ? "bg-white/20 text-white font-bold" : "text-white/40 hover:text-white"
                        )}
                      >
                        Diff View
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceViewMode('final')}
                        className={cn(
                          "px-2 py-0.5 rounded transition-all cursor-pointer",
                          voiceViewMode === 'final' ? "bg-white/20 text-white font-bold" : "text-white/40 hover:text-white"
                        )}
                      >
                        Final Voice
                      </button>
                    </div>
                  </div>

                  {/* Diff Comparison Boxes */}
                  {voiceViewMode === 'compare' ? (
                    <div className="space-y-3 font-mono text-xs">
                      {/* Generic AI Box */}
                      <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3.5 space-y-1.5">
                        <div className="text-[10px] font-mono uppercase text-rose-400 flex items-center justify-between">
                          <span>Standard AI (Generic Fluff)</span>
                          <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300">Fail</span>
                        </div>
                        <p className="text-rose-200/80 font-sans leading-relaxed text-xs">
                          {currentArchetype.generic}
                        </p>
                      </div>

                      {/* RepsBrief Neural Voice Box */}
                      <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3.5 space-y-1.5">
                        <div className="text-[10px] font-mono uppercase text-emerald-400 flex items-center justify-between">
                          <span>RepsBrief Neural Voice DNA</span>
                          <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-300">99.4% Match</span>
                        </div>
                        <p className="text-emerald-100 font-sans leading-relaxed text-xs font-medium">
                          {currentArchetype.repsbrief}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-white/[0.08] bg-black/60 p-4 space-y-3 font-sans">
                      <div className="text-xs font-mono uppercase text-purple-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ready For Teleprompter</span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">
                        {currentArchetype.repsbrief}
                      </p>
                    </div>
                  )}

                  {/* Rule Badges */}
                  <div className="pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5 text-[10.5px] font-mono text-white/50">
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-white/70">
                      ✓ No Corporate Jargon
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-white/70">
                      ✓ High Conviction Opening
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-emerald-400">
                      ✓ {currentArchetype.fluffEliminated} Fluff Clichés Stripped
                    </span>
                  </div>
                </div>

                {/* Right Column: Voice DNA Stats */}
                <div className="lg:col-span-3 bg-[#0a0a0a] flex flex-col p-4 space-y-4 justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider px-1">
                      <span>Persona Metrics</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                    </div>

                    <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-1">
                      <div className="text-[10px] font-mono text-white/40 uppercase">Voice Match Score</div>
                      <div className="text-lg font-bold text-purple-300 font-mono">99.4%</div>
                      <div className="text-[10.5px] text-white/50">Calibrated against 5 posts</div>
                    </div>

                    <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-1">
                      <div className="text-[10px] font-mono text-white/40 uppercase">Fluff Reduction</div>
                      <div className="text-lg font-bold text-emerald-400 font-mono">100% Zero-Fluff</div>
                      <div className="text-[10.5px] text-white/50">Zero generic AI phrases</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('generator')}
                    className="w-full h-8 rounded-md bg-white text-black hover:bg-white/90 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Apply Voice to Brief</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: MULTI-CHANNEL SYNC VIEW */}
            {activeTab === 'sync' && (
              <div className="grid lg:grid-cols-12 min-h-[470px] text-[13px] animate-in fade-in duration-200">
                {/* Left Column: Connected Integrations */}
                <div className="lg:col-span-4 border-r border-white/[0.08] bg-[#0c0c0c] flex flex-col p-3.5 space-y-4">
                  <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider px-1">
                    <span>Connected Integrations</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>

                  <div className="space-y-2">
                    {/* Notion Item */}
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

                    {/* Google Calendar Item */}
                    <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-[11.5px] font-semibold text-white">Google Calendar</div>
                          <div className="text-[10px] text-white/40 font-mono">Tomorrow · 09:00 AM</div>
                        </div>
                      </div>
                      <span className="size-2 rounded-full bg-blue-400" />
                    </div>

                    {/* Public Share Link Item */}
                    <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-[11.5px] font-semibold text-white">Canonical Share Route</div>
                          <div className="text-[10px] text-white/40 font-mono">repsbrief.com/s/9b12</div>
                        </div>
                      </div>
                      <span className="size-2 rounded-full bg-purple-400" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] text-[10px] font-mono text-white/40 flex items-center justify-between px-1">
                    <span>Webhooks HMAC:</span>
                    <span className="text-emerald-400">Verified ✓</span>
                  </div>
                </div>

                {/* Center Column: Interactive Link & Calendar Sandbox */}
                <div className="lg:col-span-5 border-r border-white/[0.08] bg-[#080808] flex flex-col p-5 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        Instant Distribution
                      </span>
                      <span className="text-white/30 text-xs">·</span>
                      <span className="text-white/50 text-[11px] font-mono">Zero Context Switching</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      Distribute Strategy in 1 Click
                    </h3>
                  </div>

                  {/* Public Link Copy Sandbox */}
                  <div className="rounded-lg border border-white/[0.08] bg-black/60 p-3.5 space-y-2">
                    <div className="text-[10px] font-mono uppercase text-white/40 flex items-center justify-between">
                      <span>Public Shareable Link</span>
                      <span className="text-emerald-400 font-mono text-[9px]">Live URL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://repsbrief.com/s/9b12-zone-2-cardio"
                        className="flex-1 h-8 px-2.5 rounded bg-white/[0.04] border border-white/[0.10] text-[11.5px] font-mono text-white/80 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={cn(
                          "h-8 px-3 rounded text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer",
                          isCopied
                            ? "bg-emerald-500 text-black"
                            : "bg-white text-black hover:bg-white/90"
                        )}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Notion Sync Simulator */}
                  <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-white/40">
                      <span>Notion Pipeline Status</span>
                      <span className="text-white/60">Content-Ops DB</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-white/80 font-sans">
                        {notionSynced ? '✓ Synced to your team Notion table' : 'Syncing database...'}
                      </div>
                      <button
                        type="button"
                        onClick={handleNotionSync}
                        disabled={isSyncingNotion}
                        className="h-7 px-2.5 rounded border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-white/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className={cn("w-3 h-3", isSyncingNotion && "animate-spin text-blue-400")} />
                        <span>{isSyncingNotion ? 'Syncing...' : 'Resync'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Editorial Calendar Scheduling Pill */}
                  <div className="p-3 rounded-lg border border-white/[0.06] bg-white/[0.01] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-white/70">Scheduled Slot:</span>
                      <strong className="text-white font-mono">Tomorrow 09:00 AM</strong>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">Auto-Slotted ✓</span>
                  </div>
                </div>

                {/* Right Column: Live Teleprompter Simulator */}
                <div className="lg:col-span-3 bg-[#0a0a0a] flex flex-col p-3.5 space-y-3 justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-white/50 text-[11px] font-mono uppercase tracking-wider px-1">
                      <span>Live Teleprompter</span>
                      <span className="text-[10px] font-mono text-emerald-400">Ready</span>
                    </div>

                    {/* Interactive Teleprompter Box */}
                    <div className="p-3 rounded-lg border border-white/[0.08] bg-black/80 space-y-2.5">
                      <div className="flex items-center justify-between text-[10.5px] font-mono text-white/50">
                        <span>Pacing: 148 WPM</span>
                        <span className={cn(isPlayingPrompter ? "text-rose-400 animate-pulse" : "text-white/30")}>
                          {isPlayingPrompter ? "● REC LIVE" : "PAUSED"}
                        </span>
                      </div>

                      {/* Scrolling Lines Demo */}
                      <div className="space-y-1.5 py-1 text-[11px]">
                        {[
                          'Look at your smartwatch right now during your workout.',
                          'If your heart rate hits 140 BPM, you are burning glycogen.',
                          'Drop your pace until you pass the nasal test.',
                          'Save this protocol for your next session.'
                        ].map((line, idx) => (
                          <p
                            key={idx}
                            className={cn(
                              "transition-all duration-300 font-sans",
                              idx === prompterLineIndex && isPlayingPrompter
                                ? "text-white font-bold bg-white/10 px-1 rounded -mx-1"
                                : "text-white/40"
                            )}
                          >
                            {line}
                          </p>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsPlayingPrompter(!isPlayingPrompter)}
                        className="w-full h-7 rounded bg-white text-black hover:bg-white/90 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {isPlayingPrompter ? (
                          <>
                            <Pause className="w-3 h-3 fill-black" />
                            <span>Pause Teleprompter</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-black" />
                            <span>Simulate Teleprompter</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-white/40 text-center pt-2">
                    ⚡ Teleprompter matches voice speed
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
