'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { name: 'Technology', href: '#features' },
  { name: 'Studio', href: '#studio' },
  { name: 'Ecosystem', href: '#integrations' },
  { name: 'Pricing', href: '#pricing' }
]

export function LandingNavbar() {
  const [activeSection, setActiveSection] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)

      // Detect active section
      const sections = NAV_LINKS.map(link => link.href.substring(1))
      for (const sectionId of sections.reverse()) {
        const element = document.getElementById(sectionId)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            setActiveSection(`#${sectionId}`)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={cn(
      "fixed top-0 inset-x-0 z-[100] transition-all duration-500 flex justify-center p-4 lg:p-6",
      scrolled ? "top-0" : "top-2"
    )}>
      <div className={cn(
        "container mx-auto px-6 h-16 flex items-center justify-between rounded-2xl transition-all duration-500 border border-white/0",
        scrolled 
          ? "bg-black/60 backdrop-blur-2xl border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-6xl" 
          : "bg-transparent max-w-7xl"
      )}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="RepsBrief"
            width={32}
            height={32}
            className="rounded-lg group-hover:scale-110 transition-all"
          />
          <span className="text-lg font-black tracking-tighter text-white uppercase hidden sm:block">RepsBrief</span>
        </Link>
        
        {/* Links */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={cn(
                  "text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full transition-all duration-300",
                  isActive 
                    ? "bg-white text-black shadow-lg" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                {link.name}
              </Link>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Button 
            className={cn(
              "bg-white text-black hover:bg-slate-200 text-[9px] font-black uppercase tracking-widest rounded-xl px-6 h-10 transition-all active:scale-95 shadow-lg",
              scrolled ? "shadow-blue-500/10" : "shadow-white/5"
            )} 
            asChild
          >
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
