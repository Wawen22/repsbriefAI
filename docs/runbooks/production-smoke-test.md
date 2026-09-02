# Production smoke test — safe pre-payment path

Last updated: 2026-09-02

## Preconditions

- Use a fresh controlled test inbox and a non-privileged test account.
- Confirm `RESEND_FROM_EMAIL` is a verified Resend-domain sender before expecting email delivery; production mail fails closed without it.
- Record UTC timestamp, account identifier, request/result screenshots, and any error correlation IDs. Never record secrets, Stripe session URLs, or webhook signatures.

## Safe execution path

1. Sign up with the controlled inbox, verify the session, and complete only the ordinary onboarding steps.
2. Generate one Starter brief. Confirm the brief has fresh, attributable YouTube/RSS evidence and that the quality gate reports a clear failure instead of generating output when sources are unavailable.
3. Confirm Starter gating: exactly the allowed idea subset is visible; Pro-only idea detail/remix actions remain gated.
4. Save one permitted idea, open the calendar, and confirm the saved item can be scheduled without accessing a paid entitlement.
5. Confirm billing UI may show the Pro CTA, but do **not** invoke `/api/stripe/checkout`, create a Checkout Session, enter payment data, cancel a subscription, or send a Stripe event to production.

## Separate authorized payment run

Only after explicit authorization, use a dedicated Stripe test-mode or approved live test procedure to create checkout, verify `checkout.session.completed` and subscription events at `/api/stripe/webhook`, confirm profile entitlement synchronization, and then perform any cancellation. Capture only redacted event IDs and timestamps.

## Pass criteria

- Signup, Starter generation, entitlement gating, idea save, and calendar scheduling work without console/server errors.
- The app never grants paid access before a verified subscription update.
- Missing or invalid sources and missing mail sender configuration fail safely with actionable errors.
