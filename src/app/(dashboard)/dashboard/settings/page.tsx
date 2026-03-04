import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, User, Dumbbell, Crown, Check, Zap } from "lucide-react"
import { createCustomerPortalSession } from "@/app/actions/stripe"
import { NicheSwitcher } from "@/components/settings/NicheSwitcher"

export const dynamic = 'force-dynamic'

const PLAN_FEATURES: Record<string, string[]> = {
  starter: ['1 niche', 'Weekly email delivery', '20 ideas per week', 'No dashboard access'],
  pro: ['1 niche', 'Full dashboard', '3-month history', 'Format filters', 'Idea memory'],
  team: ['Up to 3 niches', 'Dashboard for 2 users', 'White-label email', 'Priority support'],
}

const PLAN_COLOR: Record<string, string> = {
  starter: 'text-slate-400 border-slate-700',
  pro: 'text-emerald-400 border-emerald-500/40',
  team: 'text-purple-400 border-purple-500/40',
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
    return <div>Profile not found.</div>
  }

  const plan = profile.plan || 'starter'
  const isPro = plan === 'pro' || plan === 'team'
  const hasStripeCustomer = !!profile.stripe_customer_id
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.starter
  const planColor = PLAN_COLOR[plan] || PLAN_COLOR.starter

  return (
    <>
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-slate-400 mt-2">Manage your profile, niche, and subscription.</p>
      </header>

      <div className="grid gap-8 max-w-4xl">
        {/* Profile Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your personal details and account info.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</p>
                <p className="text-slate-100 font-medium">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</p>
                <p className="text-slate-100 font-medium">{profile.full_name || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Member Since</p>
                <p className="text-slate-100 font-medium">
                  {new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Niche</p>
                <p className="text-slate-100 font-medium capitalize">{(profile.active_niche || 'fitness').replace('_', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Niche Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-400" />
              Content Niche
            </CardTitle>
            <CardDescription className="text-slate-400">
              Choose the niche your weekly brief is generated for. Additional niches are coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NicheSwitcher currentNiche={profile.active_niche || 'fitness'} />
          </CardContent>
        </Card>

        {/* Subscription Card */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Subscription & Billing
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your current plan, included features, and billing management.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan */}
            <div className={`flex items-start justify-between p-4 rounded-xl border bg-slate-950/50 ${planColor}`}>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Plan</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold tracking-tight text-slate-100 capitalize">{plan}</span>
                    {isPro && (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Upgrade CTA — only for non-pro users without Stripe */}
            {!isPro && (
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-blue-400" />
                  <p className="text-sm font-semibold text-blue-400">Upgrade to Pro — $19/month</p>
                </div>
                <p className="text-xs text-slate-500">Get the full dashboard, 3-month brief history, format filters, and idea memory.</p>
                <div className="flex gap-3">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Zap className="w-3.5 h-3.5" />
                    Upgrade to Pro
                  </Button>
                  <Button size="sm" variant="ghost" className="text-slate-500 hover:text-slate-300">
                    View Plans
                  </Button>
                </div>
              </div>
            )}

            {/* Stripe Portal */}
            {hasStripeCustomer && (
              <form action={createCustomerPortalSession}>
                <Button type="submit" variant="outline" className="border-slate-700 hover:bg-slate-800">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Billing in Stripe
                </Button>
              </form>
            )}
            
            {!hasStripeCustomer && !isPro && (
              <p className="text-xs text-slate-600">
                You'll be redirected to Stripe to manage billing after upgrading.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
