import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, User } from "lucide-react"
import { createCustomerPortalSession } from "@/app/actions/stripe"

export const dynamic = 'force-dynamic'

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

  const isPro = profile.plan === 'pro'
  const hasStripeCustomer = !!profile.stripe_customer_id

  return (
    <>
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-slate-400 mt-2">Manage your profile and subscription preferences.</p>
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Email Address</p>
                <p className="text-slate-100 font-medium">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Full Name</p>
                <p className="text-slate-100 font-medium">{profile.full_name || 'Not provided'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">Account Created</p>
                <p className="text-slate-100 font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
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
              Manage your current plan and payment methods via Stripe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/50">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Current Plan</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold tracking-tight text-slate-100 capitalize">
                    {profile.plan || 'Starter'}
                  </span>
                  {isPro && (
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            <form action={createCustomerPortalSession}>
              <Button 
                type="submit" 
                variant={hasStripeCustomer ? "default" : "secondary"}
                disabled={!hasStripeCustomer}
              >
                {hasStripeCustomer ? 'Manage Billing in Stripe' : 'No Active Billing Info'}
              </Button>
            </form>
            
            {!hasStripeCustomer && (
              <p className="text-sm text-slate-500">
                You are currently on a free or manual plan. Upgrade to Pro to unlock billing management.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
