import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Zap, 
  Eye, 
  Star, 
  Video, 
  Layers, 
  Hash, 
  Mail,
  Award,
  ArrowUpRight,
  BrainCircuit
} from "lucide-react"
import { IdeaObject } from "@/types/niche"
import { cn } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const isPro = profile?.plan === 'pro' || profile?.plan === 'team'

  const { data: publishedIdeas } = await supabase
    .from('idea_history')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const ideas = publishedIdeas || []
  const totalViews = ideas.reduce((acc, i) => acc + (i.views_count || 0), 0)
  const avgScore = ideas.length > 0 
    ? (ideas.reduce((acc, i) => acc + (i.performance_score || 0), 0) / ideas.length).toFixed(1)
    : 0

  // Calculate format performance
  const formatStats = ideas.reduce((acc: any, curr: any) => {
    const fmt = curr.idea_data?.format || 'Idea'
    if (!acc[fmt]) acc[fmt] = { count: 0, views: 0, score: 0 }
    acc[fmt].count++
    acc[fmt].views += curr.views_count || 0
    acc[fmt].score += curr.performance_score || 0
    return acc
  }, {})

  const topPerformers = [...ideas]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 3)

  return (
    <div className="space-y-10 pb-20 text-left">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div className="space-y-0.5">
             <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
               Performance Hub
             </Badge>
             <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest text-left">Data-driven content strategy</p>
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white text-left">
          Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 font-extrabold">Analytics</span>
        </h1>
      </header>

      {!isPro && (
        <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-white/10 rounded-[2rem] overflow-hidden relative border-blue-500/30">
          <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-left">
            <div className="space-y-4 text-left">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-blue-400" />
                Unlock Advanced AI Insights
              </h2>
              <p className="text-slate-300 max-w-xl font-light">
                Upgrade to PRO to see deep correlation between hooks, niches, and performance. Get AI-powered advice on what to post next based on your real data.
              </p>
            </div>
            <Link href="/dashboard/settings">
              <Button className="bg-white text-black hover:bg-slate-200 rounded-full px-10 h-14 font-black text-sm uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95">
                Upgrade to Pro
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        {[
          { label: "Total Reach", value: totalViews.toLocaleString(), icon: Eye, color: "text-blue-400", sub: "Aggregated Views" },
          { label: "Avg Performance", value: `${avgScore}/5.0`, icon: Star, color: "text-yellow-400", sub: "Creator Satisfaction" },
          { label: "Published Reps", value: ideas.length, icon: Zap, color: "text-emerald-400", sub: "Strategies Deployed" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white/[0.02] border-white/5 rounded-[2rem] p-8 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className={cn("p-3 rounded-2xl bg-white/5", stat.color.replace('text', 'bg').replace('400', '500/10'))}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-700" />
            </div>
            <div className="space-y-1 text-left">
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                <span className="text-[9px] text-slate-600 font-medium uppercase">{stat.sub}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Format Performance */}
        <Card className="lg:col-span-7 bg-white/[0.02] border-white/5 rounded-[2.5rem] p-10 space-y-8 text-left">
          <div className="flex items-center justify-between">
            <div className="space-y-1 text-left text-left text-left">
              <h3 className="text-xl font-bold text-white text-left">Format Distribution</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Views by content type</p>
            </div>
            <Target className="w-5 h-5 text-slate-700" />
          </div>

          <div className="space-y-6">
            {Object.entries(formatStats).map(([format, data]: [string, any]) => (
              <div key={format} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format}s ({data.count})</span>
                  <span className="text-xs font-bold text-white">{data.views.toLocaleString()} Views</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${(data.views / (totalViews || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(formatStats).length === 0 && (
              <p className="text-slate-600 text-sm italic py-10 text-center">No data available yet. Start publishing!</p>
            )}
          </div>
        </Card>

        {/* Top Performers */}
        <Card className="lg:col-span-5 bg-white/[0.02] border-white/5 rounded-[2.5rem] p-10 space-y-8 text-left">
          <div className="flex items-center justify-between">
            <div className="space-y-1 text-left text-left text-left text-left">
              <h3 className="text-xl font-bold text-white">Top Performers</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Highest reach strategies</p>
            </div>
            <Award className="w-5 h-5 text-yellow-500/50" />
          </div>

          <div className="space-y-4">
            {topPerformers.map((idea, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-[10px] font-black text-yellow-500">
                    #{i + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{idea.idea_title}</span>
                    <span className="text-[9px] text-slate-500 uppercase font-black">{idea.idea_data?.format}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-white">{idea.views_count?.toLocaleString()}</span>
                  <p className="text-[8px] text-slate-600 font-bold uppercase">Views</p>
                </div>
              </div>
            ))}
            {topPerformers.length === 0 && (
              <p className="text-slate-600 text-sm italic py-10 text-center">Your hall of fame is waiting.</p>
            )}
          </div>
        </Card>
      </div>

      {/* AI STRATEGIC INSIGHT (Pro only mock for now) */}
      {isPro && (
        <section className="p-1 rounded-[3rem] bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-emerald-600/30">
          <div className="p-10 rounded-[2.8rem] bg-black/90 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <BrainCircuit className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">AI Strategic Insights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-left">
              <div className="space-y-4 text-left">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">The Pattern</h4>
                <p className="text-slate-300 leading-relaxed font-light">
                  Your <span className="text-white font-bold italic">Reels</span> are currently outperforming <span className="text-white font-bold italic">Carousels</span> by 42% in reach. However, <span className="text-white font-bold italic">Newsletters</span> have the highest creator satisfaction score (4.8/5).
                </p>
              </div>
              <div className="space-y-4 text-left">
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Next Week Recommendation</h4>
                <p className="text-slate-300 leading-relaxed font-light text-left">
                  Double down on <span className="text-white font-bold italic">educational storytelling</span> in your Reels. We noticed that strategies mentioning "ROI" or "Data" get 2x more estimated views.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
