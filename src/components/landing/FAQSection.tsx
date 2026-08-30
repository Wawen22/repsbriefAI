'use client'

import { useState } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    question: "What is RepsBrief and how is it different from ChatGPT?",
    answer: "ChatGPT generates generic text based on static training data. RepsBrief is an end-to-end content development environment: it continuously scrapes live Reddit, Google Trends, YouTube, and RSS signals, uses a neural brand voice engine to write scripts in your exact style, and gives you a studio with a teleprompter, editorial calendar, and 1-click Notion/Google Calendar sync."
  },
  {
    question: "How do the real-time trend scrapers work?",
    answer: "Our automated scraper cluster ingests discussions and search volume spikes across fitness subreddits, Google Trends, and research journals every morning. It filters out low-signal noise and surfaces verified breakout topics with source links and scientific citations."
  },
  {
    question: "How does Neural Brand Voice cloning work?",
    answer: "You provide examples of your top-performing videos, captions, or newsletters. Our neural persona engine extracts your specific vocabulary, sentence structure, humor style, and pacing. Every generated brief sounds authentically like you, preventing robotic AI cadence."
  },
  {
    question: "How does the 7-day free trial on Pro work?",
    answer: "When you sign up for the Pro Creator plan, you get full, unrestricted access to daily automated briefs, all 20 trend strategies, the studio teleprompter, and brand voice features for 7 days. You can cancel at any time with a single click inside your account settings."
  },
  {
    question: "Can I collaborate with my video editor and team?",
    answer: "Yes! On the Team plan, you can invite creators, video editors, and agency admins with dedicated role-based access. Creators submit drafts, editors review them, and admins approve them before pushing to your editorial calendar."
  },
  {
    question: "What platforms and integrations are supported?",
    answer: "RepsBrief generates tailored script formats for Instagram Reels, TikTok, YouTube Shorts/Long-form, and X/LinkedIn Threads. You can sync strategies directly to Notion, Google Calendar, Slack, Discord, and 6,000+ apps via Zapier and custom webhooks."
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="py-24 md:py-32 relative bg-[#000000] border-b border-white/[0.06]">
      <div className="container px-4 mx-auto max-w-[860px]">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/[0.10] bg-white/[0.03] text-white/70 text-[11px] font-mono uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-white/50 text-base sm:text-lg font-sans">
            Everything you need to know about the product, billing, and trend intelligence.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className={cn(
                  "rounded-xl border transition-all duration-200 overflow-hidden",
                  isOpen
                    ? "border-white/20 bg-[#080808]"
                    : "border-white/[0.08] bg-[#050505] hover:border-white/[0.14]"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-white cursor-pointer select-none"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-white/50 shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180 text-white"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-[13.5px] text-white/60 leading-relaxed border-t border-white/[0.04] font-sans">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

