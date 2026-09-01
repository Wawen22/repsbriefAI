'use client'

import { Button } from "@/components/ui/button"
import { Check, Zap, ArrowRight, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { trackProductEvent } from '@/lib/analytics/events'
import { cn } from "@/lib/utils"

const PLANS = [
  {
    name: "Starter",
    tagline: "For solo creators exploring trend intelligence",
    price: "$0",
    period: "Free forever",
    highlight: false,
    trialBadge: null,
    features: [
      "1 manual brief per week",
      "5 of 20 trend-backed ideas visible",
      "Fitness & Nutrition niche",
      "Source links on every idea",
      "Basic studio script generator"
    ],
    ctaText: "Start Free",
    ctaVariant: "outline" as const
  },
  {
    name: "Pro Creator",
    tagline: "For serious creators who ship daily content",
    price: "$19",
    period: "/month after trial",
    highlight: true,
    trialBadge: "7-day free trial",
    popularBadge: "MOST POPULAR",
    features: [
      "One fresh manual brief every day",
      "All 20 trend-backed strategies unlocked",
      "AI Brand Voice",
      "Integrated fullscreen teleprompter",
      "Editorial calendar & timeline",
      "Public shareable strategy links",
      "YouTube and RSS source signals"
    ],
    ctaText: "Start 7-Day Free Trial",
    ctaVariant: "default" as const
  },
  {
    name: "Team & Agency",
    tagline: "For agencies & multi-creator media teams",
    price: "$39",
    period: "/month",
    highlight: false,
    trialBadge: null,
    features: [
      "Everything in Pro Creator",
      "Unlimited team seats (Creator, Editor, Admin)",
      "Role-based review & approval gates",
      "Multi-niche workspaces",
      "1-Click Notion & Google Calendar sync",
      "Signed HMAC Webhooks (Zapier/Make)",
      "Priority scraping queue"
    ],
    ctaText: "Get Team Access",
    ctaVariant: "outline" as const
  }
]

export function PricingNexus() {
  return (
    <section id="pricing" className="py-24 md:py-32 relative bg-[#000000] border-b border-white/[0.06] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-[1240px]">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20 space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/[0.10] bg-white/[0.03] text-white/70 text-[11px] font-mono uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Simple, predictable power.
          </h2>
          <p className="text-white/50 text-base sm:text-lg font-sans">
            Start with fresh YouTube and RSS signals, then unlock daily manual generation and team workflows.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">
          {PLANS.map((plan, idx) => (
            <div
              key={idx}
              className={cn(
                "relative rounded-2xl flex flex-col justify-between transition-all duration-300 p-7 sm:p-8",
                plan.highlight
                  ? "border border-white/20 bg-[#0c0c0c] shadow-[0_20px_50px_rgba(0,0,0,0.9)] ring-1 ring-white/10 md:-translate-y-3"
                  : "border border-white/[0.08] bg-[#070707] hover:border-white/[0.16]"
              )}
            >
              {/* Highlight Badges */}
              {plan.popularBadge && (
                <div className="absolute -top-3 right-6">
                  <span className="px-3 py-1 rounded-full bg-white text-black text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
                    {plan.popularBadge}
                  </span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white tracking-tight">{plan.name}</h3>
                    {plan.trialBadge && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {plan.trialBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-white/45 text-xs font-sans mt-1.5">
                    {plan.tagline}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white">{plan.price}</span>
                    <span className="text-xs font-mono text-white/40">{plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-6 border-t border-white/[0.06] mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-white/75 font-sans">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Action */}
              <div>
                <Button
                  className={cn(
                    "w-full h-11 rounded-md text-xs font-medium transition-all shadow-sm cursor-pointer",
                    plan.highlight
                      ? "bg-white text-black hover:bg-white/90 font-semibold"
                      : "border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white hover:text-white"
                  )}
                  asChild
                >
                  <Link
                    href="/signup"
                    onClick={() => trackProductEvent('signup_cta_clicked', { location: 'pricing' })}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
                <p className="text-[11px] font-mono text-white/30 text-center mt-2.5">
                  {plan.name === 'Starter' ? 'No credit card needed' : 'Cancel anytime with 1 click'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Guarantee */}
        <div className="mt-14 flex items-center justify-center gap-2 text-xs font-mono text-white/40 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>7-Day Free Trial on Pro · Secure Stripe Billing · Instant Setup</span>
        </div>
      </div>
    </section>
  )
}
