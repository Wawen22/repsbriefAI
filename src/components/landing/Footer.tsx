'use client'

import Link from "next/link"
import Image from "next/image"

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#000000] py-16 md:py-24 text-left text-xs font-sans">
      <div className="container mx-auto px-4 max-w-[1240px]">
        <div className="grid md:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="RepsBrief"
                width={28}
                height={28}
                className="rounded-lg"
              />
              <span className="font-sans font-bold text-sm tracking-tight text-white uppercase">
                REPSBRIEF
              </span>
            </Link>
            <p className="text-white/50 max-w-sm text-xs sm:text-[13px] leading-relaxed">
              The strategic content development environment (ADE) for creators, editors, and digital agencies who refuse to post average content.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-white/[0.08] bg-white/[0.02] text-[11px] font-mono text-white/50">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Scrapers & Models Active</span>
            </div>
          </div>

          {/* Nav Columns */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h5 className="font-mono text-[11px] uppercase tracking-wider text-white/40">Product</h5>
              <ul className="space-y-2.5 text-white/60">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#studio" className="hover:text-white transition-colors">Studio & Prompter</Link></li>
                <li><Link href="#comparison" className="hover:text-white transition-colors">Comparison</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-mono text-[11px] uppercase tracking-wider text-white/40">Ecosystem</h5>
              <ul className="space-y-2.5 text-white/60">
                <li><Link href="#features" className="hover:text-white transition-colors">Notion Sync</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Google Calendar</Link></li>
                <li><Link href="#features" className="hover:text-white transition-colors">Zapier & Webhooks</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Create Account →</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="font-mono text-[11px] uppercase tracking-wider text-white/40">Legal & Auth</h5>
              <ul className="space-y-2.5 text-white/60">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-white/40">
          <p>© 2026 RepsBrief. Built for high-velocity creators.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

