import Link from "next/link";
import { getAccessFromCookie } from "@/lib/access";
import { PaywallCard } from "@/components/PaywallCard";
import { ScanWorkspace } from "@/components/ScanWorkspace";

export default async function ScanPage(): Promise<React.JSX.Element> {
  const access = await getAccessFromCookie();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#58a6ff]">Scanner</p>
          <h1 className="mt-1 text-3xl font-bold text-white">GDPR Cookie Compliance Scanner</h1>
          <p className="mt-2 text-sm text-slate-400">
            Crawl a live site, detect cookie compliance risks, and generate implementation-ready fixes.
          </p>
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-[#8bc5ff] transition hover:text-[#58a6ff]">
          Open Dashboard
        </Link>
      </div>

      {access ? <ScanWorkspace /> : <PaywallCard />}
    </main>
  );
}
