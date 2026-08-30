'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"
import { trackProductEvent } from '@/lib/analytics/events'
import { SampleBriefButton } from "./SampleBriefButton"

export function BottomCTA() {
  return (
    <section className="py-24 md:py-36 relative overflow-hidden bg-[#000000] text-center">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="container relative z-10 px-4 mx-auto max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-white/[0.10] bg-white/[0.03] text-white/70 text-xs font-mono uppercase tracking-wider mb-6">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Instant Setup · No Credit Card For Starter</span>
        </div>

        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 uppercase">
          Get RepsBrief
        </h2>

        <p className="text-white/50 text-base sm:text-xl font-sans max-w-2xl mx-auto mb-10 leading-relaxed">
          Stop staring at a blank script editor. Connect to live trend intelligence and start shipping data-backed content today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <Button
            size="lg"
            className="h-12 px-7 rounded-md bg-white text-black hover:bg-white/90 text-sm font-medium transition-all w-full sm:w-auto shadow-sm cursor-pointer"
            asChild
          >
            <Link
              href="/signup"
              onClick={() => trackProductEvent('signup_cta_clicked', { location: 'hero' })}
              className="flex items-center justify-center gap-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          <SampleBriefButton />
        </div>

        <p className="text-xs font-mono text-white/30 mt-6">
          7-day free trial on Pro · Cancel anytime · Instant access
        </p>
      </div>
    </section>
  )
}

