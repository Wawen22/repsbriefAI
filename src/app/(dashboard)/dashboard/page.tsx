// src/app/(dashboard)/dashboard/page.tsx

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { IdeaObject } from "@/types/niche"
import { BriefCard } from "@/components/brief/BriefCard"
import { BriefList } from "@/components/brief/BriefList"
import { NichePicker } from "@/components/niche/NichePicker"
import { AddIdeaModal } from "@/components/ui/AddIdeaModal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, LayoutGrid, Calendar, Inbox, Crown, ChevronRight, Zap } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const weekDate = new Date().toISOString().split('T')[0]
  
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: brief } = await supabase
    .from('briefs')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_date', weekDate)
    .single()

  const ideas: IdeaObject[] = brief?.ideas || []
  const hasBrief = ideas.length > 0

  return (
    <>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <NichePicker />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">The Weekly Reps</h1>
              <p className="text-slate-400 mt-2">Your 20 high-impact content ideas generated from this week's data.</p>
            </div>
            <div className="flex items-center gap-3">
               <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-1.5 px-3">
                 <Zap className="w-3.5 h-3.5 mr-1.5 fill-emerald-500" /> Fresh Data
               </Badge>
               <AddIdeaModal />
            </div>
          </header>

          {!hasBrief ? (
             <Card className="bg-slate-900 border-dashed border-slate-800 p-20 text-center">
                <CardContent className="space-y-4">
                   <LayoutGrid className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                   <h2 className="text-xl font-bold">No Brief Yet</h2>
                   <p className="text-slate-500 max-w-sm mx-auto">
                     Your first brief is being generated or hasn't arrived yet. 
                     Check back on Monday morning!
                   </p>
                </CardContent>
             </Card>
          ) : (
            <Tabs defaultValue="all" className="space-y-8">
              <TabsList className="bg-slate-900 border-slate-800 p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-slate-800 px-6">All Formats</TabsTrigger>
                <TabsTrigger value="reel" className="data-[state=active]:bg-slate-800 px-6">Reels</TabsTrigger>
                <TabsTrigger value="carousel" className="data-[state=active]:bg-slate-800 px-6">Carousels</TabsTrigger>
                <TabsTrigger value="thread" className="data-[state=active]:bg-slate-800 px-6">Threads</TabsTrigger>
                <TabsTrigger value="newsletter" className="data-[state=active]:bg-slate-800 px-6">Newsletter</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="focus-visible:outline-none">
                <BriefList ideas={ideas} />
              </TabsContent>
              
              <TabsContent value="reel" className="focus-visible:outline-none">
                <BriefList ideas={ideas.filter(i => i.format === 'Reel')} />
              </TabsContent>
              
              <TabsContent value="carousel" className="focus-visible:outline-none">
                <BriefList ideas={ideas.filter(i => i.format === 'Carousel')} />
              </TabsContent>

              <TabsContent value="thread" className="focus-visible:outline-none">
                <BriefList ideas={ideas.filter(i => i.format === 'Thread')} />
              </TabsContent>

              <TabsContent value="newsletter" className="focus-visible:outline-none">
                <BriefList ideas={ideas.filter(i => i.format === 'Newsletter')} />
              </TabsContent>
            </Tabs>
      )}
    </>
  )
}
