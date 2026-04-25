import Link from "next/link";
import { ArrowRight, Check, Shield, TriangleAlert } from "lucide-react";
import { PricingSection } from "@/components/PricingSection";

const problemCards = [
  {
    title: "Fines and enforcement are real",
    body: "EU regulators keep enforcing invalid cookie consent patterns. Non-compliant banners and pre-consent trackers are common triggers.",
    icon: TriangleAlert
  },
  {
    title: "Legal audits are expensive",
    body: "Most SMEs cannot justify recurring legal retainers only for cookie compliance checks.",
    icon: TriangleAlert
  },
  {
    title: "Technical fixes are fragmented",
    body: "Even when issues are found, teams often lack implementation-ready banner code and script-blocking guidance.",
    icon: TriangleAlert
  }
];

const solutionSteps = [
  "Run a live scan against any production URL",
  "Detect trackers, cookie patterns, and consent UX gaps",
  "Receive a GDPR/ePrivacy risk score with issue-by-issue legal references",
  "Generate a compliant cookie banner with reject + granular controls",
  "Use stored scan history to prove continuous compliance effort"
];

const faqItems = [
  {
    q: "What does the scanner check?",
    a: "It checks banner presence, reject flow, category controls, policy disclosure, visible tracker signatures, and likely non-essential cookie behavior before consent."
  },
  {
    q: "Will this replace legal counsel?",
    a: "No. This tool reduces obvious implementation risk and speeds remediation, but regulated or high-risk businesses should still review with counsel."
  },
  {
    q: "How does paywall access work?",
    a: "After Stripe checkout, your webhook records entitlement. Enter the purchase email in the app and a secure access cookie unlocks scanning and dashboard features."
  },
  {
    q: "Can agencies use it for client sites?",
    a: "Yes. Agencies can run repeat audits and deliver code-ready banner fixes for each client domain."
  }
];

export default function HomePage(): React.JSX.Element {
  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "#";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-[#30363d] bg-[#111827]/80 p-8 shadow-2xl shadow-black/25 backdrop-blur sm:p-12">
        <p className="inline-flex items-center rounded-full border border-[#2f81f7]/40 bg-[#2f81f7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#8bc5ff]">
          Automated GDPR Cookie Compliance Scanner
        </p>
        <h1 className="mt-5 max-w-3xl font-[var(--font-heading)] text-4xl font-bold leading-tight text-white sm:text-5xl">
          Audit your website for GDPR cookie risk and ship compliant fixes in one workflow.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          GDPR Cookie Audit crawls your pages, flags non-compliant consent behavior, and generates a legally aligned cookie
          banner your team can implement immediately.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/scan"
            className="inline-flex items-center justify-center rounded-md bg-[#2f81f7] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1f6feb]"
          >
            Start Scanning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <a
            href={stripeLink}
            className="inline-flex items-center justify-center rounded-md border border-[#30363d] bg-[#111827] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-[#1d232b]"
            rel="noopener noreferrer"
            target="_blank"
          >
            Buy Access ($19/mo)
          </a>
        </div>
      </header>

      <section className="mt-14">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#58a6ff]">The Problem</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-100">Cookie compliance fails quietly until a complaint arrives.</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {problemCards.map((card) => (
            <article key={card.title} className="rounded-xl border border-[#30363d] bg-[#111827] p-5">
              <card.icon className="h-5 w-5 text-amber-400" />
              <h3 className="mt-3 text-lg font-semibold text-slate-100">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-[#30363d] bg-[#111827] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#58a6ff]">The Solution</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-100">From scan to compliant implementation in minutes.</h2>
        <ul className="mt-6 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
          {solutionSteps.map((step) => (
            <li key={step} className="flex gap-3 rounded-md border border-[#2a3441] bg-[#0f1724] p-3">
              <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-[#30363d] bg-[#111827] p-6">
          <Shield className="h-5 w-5 text-[#58a6ff]" />
          <h3 className="mt-3 text-xl font-semibold text-slate-100">Built for EU small business reality</h3>
          <p className="mt-2 text-sm text-slate-300">
            You get compliance-focused technical output without enterprise contracts, long legal projects, or one-off PDF
            audits that become stale quickly.
          </p>
        </article>
        <article className="rounded-xl border border-[#30363d] bg-[#111827] p-6">
          <Shield className="h-5 w-5 text-[#58a6ff]" />
          <h3 className="mt-3 text-xl font-semibold text-slate-100">Made for implementers, not only auditors</h3>
          <p className="mt-2 text-sm text-slate-300">
            Each issue includes practical remediation guidance and generated banner code with first-layer reject and
            category-level controls.
          </p>
        </article>
      </section>

      <div className="mt-14">
        <PricingSection />
      </div>

      <section className="mt-14 rounded-2xl border border-[#30363d] bg-[#111827] p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#58a6ff]">FAQ</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-100">Answers before you deploy</h2>
        <div className="mt-6 space-y-4">
          {faqItems.map((item) => (
            <article key={item.q} className="rounded-lg border border-[#2a3441] bg-[#0f1724] p-4">
              <h3 className="text-base font-semibold text-slate-100">{item.q}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
