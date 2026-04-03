import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy — RepsBrief',
  description: 'How RepsBrief collects, uses and protects your personal data.',
}

export default function PrivacyPage() {
  const lastUpdated = 'April 3, 2026'

  return (
    <div className="min-h-screen bg-black text-slate-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-sm font-medium transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to RepsBrief
        </Link>

        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-12">Last updated: {lastUpdated}</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Who we are</h2>
            <p>
              RepsBrief (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a content intelligence platform
              available at <strong className="text-white">repsbrief.com</strong>. We help creators and
              agencies generate AI-powered content briefs from real-time trends.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Data we collect</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li><strong className="text-slate-300">Account data</strong> — email address, name, and authentication credentials provided at signup.</li>
              <li><strong className="text-slate-300">Usage data</strong> — content briefs generated, ideas saved, niche preferences, and calendar events.</li>
              <li><strong className="text-slate-300">Billing data</strong> — payment is processed by Stripe. We store only a reference to your Stripe customer ID; we never see your full card details.</li>
              <li><strong className="text-slate-300">Technical data</strong> — IP address, browser type, and error logs collected via Sentry for stability monitoring.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. How we use your data</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>To provide, operate and improve the RepsBrief service.</li>
              <li>To send transactional emails (account confirmation, brief-ready notifications, billing receipts).</li>
              <li>To send onboarding and re-engagement emails. You can unsubscribe at any time.</li>
              <li>To detect and fix errors in our application.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Third-party services</h2>
            <p className="text-slate-400">
              We use the following sub-processors to deliver the service:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li><strong className="text-slate-300">Supabase</strong> — database and authentication hosting.</li>
              <li><strong className="text-slate-300">Stripe</strong> — payment processing. See <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">stripe.com/privacy</a>.</li>
              <li><strong className="text-slate-300">Resend</strong> — transactional email delivery.</li>
              <li><strong className="text-slate-300">Vercel</strong> — hosting and edge infrastructure.</li>
              <li><strong className="text-slate-300">Sentry</strong> — error monitoring and session replay (anonymised).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Data retention</h2>
            <p className="text-slate-400">
              We retain your account data for as long as your account is active. If you delete your account,
              we will delete your personal data within 30 days, except where retention is required by law or for
              fraud prevention.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">6. Your rights</h2>
            <p className="text-slate-400">
              You have the right to access, correct, or delete your personal data at any time. To exercise
              these rights, email us at <a href="mailto:privacy@repsbrief.com" className="text-blue-400 hover:text-blue-300">privacy@repsbrief.com</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">7. Cookies</h2>
            <p className="text-slate-400">
              We use strictly necessary cookies for authentication (session token). We do not use advertising
              or tracking cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">8. Changes to this policy</h2>
            <p className="text-slate-400">
              We may update this policy periodically. We will notify you of material changes by email or
              via an in-app notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">9. Contact</h2>
            <p className="text-slate-400">
              Questions? Email <a href="mailto:privacy@repsbrief.com" className="text-blue-400 hover:text-blue-300">privacy@repsbrief.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
