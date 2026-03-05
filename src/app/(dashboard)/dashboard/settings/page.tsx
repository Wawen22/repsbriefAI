import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, User, Dumbbell, Check, Zap, Settings, ShieldCheck, Mail, BrainCircuit } from "lucide-react"
import { createCustomerPortalSession } from "@/app/actions/stripe"
import { NicheSwitcher } from "@/components/settings/NicheSwitcher"
import { BrandVoiceSettings } from "@/components/settings/BrandVoiceSettings"
import { UpgradeToProButton } from "@/components/settings/UpgradeToProButton"

export const dynamic = 'force-dynamic'

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['1 niche', 'Weekly email delivery', '20 ideas per week', 'No dashboard access'],
  pro: ['1 niche', 'Full dashboard', '3-month history', 'Format filters', 'Idea memory'],
  team: ['Up to 3 niches', 'Dashboard for 2 users', 'White-label email', 'Priority support'],
}

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return <div className="p-12 text-center text-slate-500">Profile not found.</div>
  }

  const plan = profile.plan || 'starter'
  const isPro = plan === 'pro' || plan === 'team'
  const hasStripeCustomer = !!profile.stripe_customer_id
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.starter

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <Badge variant="outline" className="bg-blue-500/5 text-blue-300 border-blue-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
              Preferences
            </Badge>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Settings</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl font-light">
              Manage your personal vault, niche strategy, and subscription.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Settings Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Profile Section */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <User className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Identity</h2>
                <p className="text-sm text-slate-500">Your personal profile and account credentials.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Email Address</label>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                   <Mail className="w-4 h-4 text-slate-500" />
                   <p className="text-slate-100 font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Member Since</label>
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/5">
                   <ShieldCheck className="w-4 h-4 text-slate-500" />
                   <p className="text-slate-100 font-medium">
                     {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                   </p>
                </div>
              </div>
            </div>
          </div>

          {/* Niche Strategy Section */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Dumbbell className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Content Strategy</h2>
                <p className="text-sm text-slate-500">Change your active niche to pivot your briefing data.</p>
              </div>
            </div>
            <NicheSwitcher currentNiche={profile.active_niche || 'fitness'} />
          </div>

          {/* Brand Voice Tuning Section */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <BrainCircuit className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Personalized Brand Voice</h2>
                <p className="text-sm text-slate-500">Train the AI to write scripts in your unique style.</p>
              </div>
            </div>
            <BrandVoiceSettings 
              initialSamples={profile.writing_samples || []} 
              currentAnalysis={profile.brand_voice || null} 
            />
          </div>

        </div>

        {/* Sidebar / Billing Column */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Subscription Status Card */}
          <div className={`rounded-3xl border p-1 relative overflow-hidden flex flex-col ${isPro ? 'bg-blue-600/10 border-blue-500/20' : 'bg-white/[0.02] border-white/10'}`}>
            <div className="p-7 space-y-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-white/5 text-slate-400 border-none text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest leading-normal">
                   Subscription Plan
                </Badge>
                {isPro && (
                  <div className="p-1 rounded-full bg-emerald-500/20"><Check className="w-3 h-3 text-emerald-400" /></div>
                )}
              </div>

              <div>
                <h3 className="text-3xl font-black text-white capitalize tracking-tighter">{plan}</h3>
                <p className="text-slate-500 text-sm mt-1">Included in your plan:</p>
              </div>

              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {!isPro && (
                <div className="pt-4 border-t border-white/5">
                  <UpgradeToProButton />
                </div>
              )}

              {hasStripeCustomer && (
                <form action={createCustomerPortalSession} className="w-full">
                  <Button type="submit" variant="outline" className="w-full rounded-full border-white/10 hover:bg-white/5 text-slate-300 font-bold h-12">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                </form>
              )}
            </div>

            {/* Subtle Gradient Glow for Pro */}
            {isPro && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            )}
          </div>

          {/* Additional Info Box */}
          <div className="p-7 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
             </div>
             <div>
                <h4 className="font-bold text-white mb-1">New Features Coming</h4>
                <p className="text-[12px] text-slate-500 leading-relaxed font-light">We&apos;re building support for multiple niches and team collaboration. Stay tuned for our Q2 roadmap.</p>
             </div>
          </div>

        </div>

      </div>
    </div>
  )
}
