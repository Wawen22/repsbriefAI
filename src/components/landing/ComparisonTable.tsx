'use client'

import { Check, X, Sparkles } from 'lucide-react'

const COMPARISON_ROWS = [
  {
    feature: "Trend sources (YouTube and RSS)",
    repsbrief: "Fresh signals when you generate",
    chatgpt: "Stale training data / Manual search",
    notion: "100% Manual research"
  },
  {
    feature: "Neural Persona & Brand Voice Memory",
    repsbrief: "Permanent voice profile & tone injection",
    chatgpt: "Requires 500-word prompt every chat",
    notion: "Manual text guidelines"
  },
  {
    feature: "Multi-Player Roles & Approval Gates",
    repsbrief: "Built-in Creator, Editor & Admin sign-offs",
    chatgpt: "Single player / No team flows",
    notion: "Fragile database permissions"
  },
  {
    feature: "Integrated Recording Teleprompter",
    repsbrief: "Fullscreen prompter with WPM pacing",
    chatgpt: "None",
    notion: "None"
  },
  {
    feature: "Direct Google Calendar & Notion Sync",
    repsbrief: "Calendar and integration exports",
    chatgpt: "Manual copy & paste",
    notion: "Requires custom Zapier setups"
  },
  {
    feature: "Source Evidence & Scientific Backing",
    repsbrief: "Available YouTube and RSS signals",
    chatgpt: "High hallucination risk",
    notion: "Manual linking"
  }
]

export function ComparisonTable() {
  return (
    <section id="comparison" className="py-24 md:py-32 relative bg-[#000000] border-b border-white/[0.06]">
      <div className="container px-4 mx-auto max-w-[1240px]">
        {/* Section Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/[0.10] bg-white/[0.03] text-white/70 text-[11px] font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Side by Side Analysis</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Why creators choose RepsBrief over chatbots.
          </h2>
          <p className="text-white/50 text-base sm:text-lg font-sans">
            AI text generators produce generic filler. RepsBrief provides a complete operating system built specifically for strategic content production.
          </p>
        </div>

        {/* Matrix Container */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-[#070707] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0c0c0c] text-xs font-mono text-white/60 uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Capabilities</th>
                  <th className="py-4 px-6 text-white font-bold bg-white/[0.04] border-x border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>RepsBrief Studio</span>
                    </div>
                  </th>
                  <th className="py-4 px-6">Generic AI (ChatGPT)</th>
                  <th className="py-4 px-6">Spreadsheets / Notion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-xs sm:text-[13px]">
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-medium text-white/90">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 font-semibold text-emerald-400 bg-white/[0.02] border-x border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{row.repsbrief}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white/50">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-500/80 shrink-0" />
                        <span>{row.chatgpt}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-white/40">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-500/80 shrink-0" />
                        <span>{row.notion}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
