import { LandingNavbar } from "@/components/landing/Navbar"
import { HeroSection } from "@/components/landing/HeroSection"
import { LogosMarquee } from "@/components/landing/LogosMarquee"
import { MobileSpotlight } from "@/components/landing/MobileSpotlight"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { ComparisonTable } from "@/components/landing/ComparisonTable"
import { TestimonialsWall } from "@/components/landing/TestimonialsWall"
import { PricingNexus } from "@/components/landing/PricingNexus"
import { FAQSection } from "@/components/landing/FAQSection"
import { BottomCTA } from "@/components/landing/BottomCTA"
import { LandingFooter } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-white/20 selection:text-white overflow-x-hidden font-sans antialiased">
      
      {/* Global Atmosphere & Technical Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-white/[0.02] blur-[150px] rounded-full" />
      </div>

      {/* Navigation Header */}
      <LandingNavbar />

      {/* Main Sections Content */}
      <main className="relative z-10">
        <HeroSection />
        <LogosMarquee />
        <div id="studio">
          <MobileSpotlight />
        </div>
        <FeaturesGrid />
        <ComparisonTable />
        <TestimonialsWall />
        <PricingNexus />
        <FAQSection />
        <BottomCTA />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}
