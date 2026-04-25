import { CheckCircle2 } from "lucide-react";

export function PricingSection(): React.JSX.Element {
  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "#";

  return (
    <section id="pricing" className="rounded-2xl border border-[#30363d] bg-[#111827] p-8 sm:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#58a6ff]">Simple Pricing</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-100 sm:text-4xl">
          Stop guessing. Launch a compliant consent flow this week.
        </h2>
        <p className="mt-4 text-slate-300">
          One plan for agencies and business owners who want actionable GDPR cookie audits without paying legal
          consultants thousands per year.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-[#2a3441] bg-[#0f1724] p-6 shadow-xl shadow-black/20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xl font-semibold text-slate-100">Compliance Starter</p>
            <p className="mt-1 text-sm text-slate-400">Automated scans + compliant banner code + weekly reminders</p>
          </div>
          <p className="text-3xl font-bold text-white">$19<span className="text-base text-slate-400">/mo</span></p>
        </div>

        <ul className="mt-5 space-y-3 text-sm text-slate-200">
          {[
            "Unlimited cookie scans for one production domain",
            "Risk scoring mapped to GDPR and ePrivacy expectations",
            "Ready-to-embed cookie banner with reject and granular controls",
            "Stored scan history with issue trends",
            "Webhook-based entitlement and paywalled dashboard access"
          ].map((item) => (
            <li key={item} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <a
          href={stripeLink}
          className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[#2f81f7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6feb]"
          rel="noopener noreferrer"
          target="_blank"
        >
          Buy Secure Access
        </a>
        <p className="mt-3 text-center text-xs text-slate-500">
          After checkout, enter the purchase email in the dashboard to activate your access cookie.
        </p>
      </div>
    </section>
  );
}
