'use client'

import { useState } from 'react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Instagram, 
  Video, 
  Linkedin, 
  Youtube, 
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScheduleDialog } from './ScheduleDialog'

type CalendarEntry = {
  id: string;
  title: string;
  scheduled_date: string;
  platform: string;
  status: string;
  hook?: string;
  script_draft?: string;
}

export function CalendarView({ initialEntries }: { initialEntries: CalendarEntry[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries] = useState(initialEntries)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-3 h-3 text-pink-400" />
      case 'tiktok': return <Video className="w-3 h-3 text-emerald-400" />
      case 'linkedin': return <Linkedin className="w-3 h-3 text-blue-400" />
      case 'youtube': return <Youtube className="w-3 h-3 text-rose-400" />
      default: return <Plus className="w-3 h-3" />
    }
  }

  const handleAddClick = (date?: Date) => {
    setSelectedDate(date)
    setIsScheduleOpen(true)
  }

  return (
    <div className="flex flex-col h-full text-left">
      <ScheduleDialog 
        isOpen={isScheduleOpen} 
        onOpenChange={setIsScheduleOpen} 
        initialData={selectedDate ? { title: '', date: selectedDate } : undefined} 
      />

      {/* Calendar Header */}
      <div className="flex items-center justify-between p-8 border-b border-white/5">
        <div className="flex flex-col gap-1 text-left">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <Clock className="w-3 h-3" />
            {entries.length} Planned Strategies
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="w-px h-4 bg-white/10 mx-1" />
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())} className="h-10 rounded-xl border-white/10 text-xs font-bold text-slate-300">
            Today
          </Button>
          <Button 
            onClick={() => handleAddClick()}
            className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 px-4 shadow-xl shadow-blue-500/10 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Content</span>
          </Button>
        </div>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-white/5 bg-white/[0.01]">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="py-3 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center border-r border-white/5 last:border-0">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1">
        {calendarDays.map((day) => {
          const dayEntries = entries.filter(e => isSameDay(new Date(e.scheduled_date), day))
          const isSelectedMonth = isSameMonth(day, monthStart)
          const isTodayDate = isToday(day)

          return (
            <div 
              key={day.toString()} 
              onClick={() => isSelectedMonth && handleAddClick(day)}
              className={cn(
                "min-h-[140px] p-2 border-r border-b border-white/5 transition-colors group flex flex-col gap-2 cursor-pointer",
                !isSelectedMonth && "bg-black/40 opacity-40 grayscale-[0.5]",
                isSelectedMonth && "hover:bg-white/[0.02]"
              )}
            >
              <div className="flex items-center justify-between px-2 pt-1 pointer-events-none">
                <span className={cn(
                  "text-[11px] font-black transition-colors",
                  isTodayDate ? "text-blue-400 flex items-center gap-1.5" : "text-slate-500 group-hover:text-slate-300"
                )}>
                  {format(day, 'd')}
                  {isTodayDate && <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
                </span>
                {isSelectedMonth && (
                  <div className="opacity-0 group-hover:opacity-100 p-1 bg-white/10 rounded-md transition-all">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[100px] scrollbar-hide pointer-events-none">
                {dayEntries.map((entry) => (
                  <div 
                    key={entry.id}
                    className="p-2 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all group/item text-left"
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-left">
                      {getPlatformIcon(entry.platform)}
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{entry.platform}</span>
                    </div>
                    <p className="text-[10px] font-bold text-white leading-tight truncate">
                      {entry.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
