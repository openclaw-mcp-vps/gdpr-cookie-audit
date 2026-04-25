import Link from "next/link";
import { BarChart3, ShieldCheck, ShieldX } from "lucide-react";
import { getAccessFromCookie } from "@/lib/access";
import { getScanHistoryByOwner } from "@/lib/database";
import { PaywallCard } from "@/components/PaywallCard";
import { DashboardCharts } from "@/components/DashboardCharts";

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const access = await getAccessFromCookie();

  if (!access) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#58a6ff]">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Compliance Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">Scan history and trend analytics are available after purchase.</p>
        </div>
        <PaywallCard />
      </main>
    );
  }

  const history = await getScanHistoryByOwner(access.email);
  const latest = history[0];

  const needsAttentionCount = history.filter((item) => item.score < 60).length;
  const healthyCount = history.filter((item) => item.score >= 85).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#58a6ff]">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Compliance Overview</h1>
          <p className="mt-2 text-sm text-slate-400">
            Logged in as <span className="font-semibold text-slate-300">{access.email}</span>. Monitor compliance trend and
            recurring risks.
          </p>
        </div>
        <Link href="/scan" className="text-sm font-semibold text-[#8bc5ff] transition hover:text-[#58a6ff]">
          Run New Scan
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-[#30363d] bg-[#111827] p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Latest Score</p>
          <p className="mt-2 text-3xl font-bold text-white">{latest?.score ?? "-"}</p>
          <p className="mt-1 text-sm text-slate-400">out of 100</p>
        </article>
        <article className="rounded-xl border border-[#30363d] bg-[#111827] p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <ShieldX className="h-4 w-4 text-red-400" />
            At-Risk Scans
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{needsAttentionCount}</p>
          <p className="mt-1 text-sm text-slate-400">score below 60</p>
        </article>
        <article className="rounded-xl border border-[#30363d] bg-[#111827] p-4">
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Healthy Scans
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{healthyCount}</p>
          <p className="mt-1 text-sm text-slate-400">score 85 or above</p>
        </article>
      </div>

      {history.length > 0 ? (
        <div className="mt-6 space-y-4">
          <DashboardCharts history={history} />
          <section className="rounded-xl border border-[#30363d] bg-[#111827] p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              <BarChart3 className="h-4 w-4 text-[#58a6ff]" />
              Recent Scans
            </p>
            <div className="mt-3 overflow-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Domain</th>
                    <th className="py-2 pr-4">Score</th>
                    <th className="py-2 pr-4">Critical</th>
                    <th className="py-2 pr-4">High</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 12).map((item) => (
                    <tr key={item.id} className="border-t border-[#2a3441]">
                      <td className="py-2 pr-4">{new Date(item.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-4">{item.domain}</td>
                      <td className="py-2 pr-4">{item.score}</td>
                      <td className="py-2 pr-4">{item.issuesBySeverity.critical}</td>
                      <td className="py-2 pr-4">{item.issuesBySeverity.high}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <section className="mt-6 rounded-xl border border-[#30363d] bg-[#111827] p-5 text-sm text-slate-300">
          No scans yet. Run your first domain scan to generate a compliance baseline and trend data.
        </section>
      )}
    </main>
  );
}
