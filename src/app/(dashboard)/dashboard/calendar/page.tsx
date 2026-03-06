// src/app/(dashboard)/dashboard/calendar/page.tsx
import { getCalendarEntriesAction } from "@/app/actions/calendar"
import { CalendarView } from "@/components/calendar/CalendarView"
import { Badge } from "@/components/ui/badge"
import { Sparkles, CalendarDays } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const { data: entries } = await getCalendarEntriesAction()

  return (
    <div className="space-y-8 pb-10 text-left">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <CalendarDays className="w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-0.5">
             <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
               Content Production
             </Badge>
             <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Schedule your growth</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
            Editorial <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-extrabold">Calendar</span>
          </h1>
          <p className="max-w-md text-slate-400 text-sm font-light leading-relaxed">
            Plan your hooks and scripts across multiple platforms to maintain a consistent output.
          </p>
        </div>
      </header>

      <div className="p-1 rounded-[3rem] bg-gradient-to-b from-white/10 to-transparent">
        <div className="bg-black/90 rounded-[2.8rem] overflow-hidden border border-white/5 min-h-[600px]">
          <CalendarView initialEntries={entries || []} />
        </div>
      </div>
    </div>
  )
}
