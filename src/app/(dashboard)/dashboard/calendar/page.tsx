// src/app/(dashboard)/dashboard/calendar/page.tsx
import { getCalendarEntriesAction } from "@/app/actions/calendar"
import { CalendarView } from "@/components/calendar/CalendarView"
import { CalendarDays } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const { data: entries } = await getCalendarEntriesAction()

  return (
    <div className="space-y-8 pb-10 text-left">
      <header className="space-y-1.5 text-left">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-mono uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-white/60">
          <CalendarDays className="w-3 h-3 text-blue-400" />
          <span>Editorial Timeline</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
          Editorial Calendar
        </h1>
        <p className="text-white/50 text-sm md:text-base font-sans max-w-xl">
          Plan, schedule, and sync strategic content slots across YouTube, Reels, and Newsletters.
        </p>
      </header>

      <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#070707] min-h-[600px] shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
        <CalendarView initialEntries={entries || []} />
      </div>
    </div>
  )
}
