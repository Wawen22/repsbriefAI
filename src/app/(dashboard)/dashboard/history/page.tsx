import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BriefList } from "@/components/brief/BriefList"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CalendarDays, ChevronDown } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: briefs } = await supabase
    .from('briefs')
    .select('*')
    .eq('user_id', user.id)
    .order('week_date', { ascending: false })

  const hasHistory = briefs && briefs.length > 0

  return (
    <>
      <header className="mb-10 flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Brief History</h1>
        <p className="text-slate-400">Past content briefs generated for your niches.</p>
      </header>

      {!hasHistory ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
          <p>Your history will appear here once you receive more briefs over the coming weeks.</p>
        </div>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {briefs.map((brief) => {
            const dateObj = new Date(brief.week_date)
            // Generate a readable date, e.g., "Week of Feb 22, 2026"
            const readableDate = dateObj.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })

            return (
              <AccordionItem 
                key={brief.id} 
                value={brief.id}
                className="bg-slate-900 border border-slate-800 rounded-xl px-2 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline hover:bg-slate-800/50 px-4 py-4 rounded-xl transition-colors data-[state=open]:rounded-b-none data-[state=open]:border-b border-slate-800">
                  <div className="flex items-center gap-3 text-left">
                    <CalendarDays className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">Week of {readableDate}</h3>
                      <p className="text-sm text-slate-500 font-normal">Niche: <span className="capitalize">{brief.niche}</span> • {brief.ideas?.length || 0} Ideas</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-6 pb-4 px-4 bg-slate-950/50">
                   <BriefList ideas={brief.ideas || []} />
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </>
  )
}
