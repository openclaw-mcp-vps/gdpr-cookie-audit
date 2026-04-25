"use client";

import { AlertTriangle, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import type { ComplianceReport as ComplianceReportType } from "@/lib/types";

type ComplianceReportProps = {
  report: ComplianceReportType;
};

function VerdictIcon({ verdict }: { verdict: ComplianceReportType["verdict"] }): React.JSX.Element {
  if (verdict === "compliant") return <ShieldCheck className="h-5 w-5 text-emerald-400" />;
  if (verdict === "at-risk") return <ShieldAlert className="h-5 w-5 text-amber-400" />;
  return <ShieldX className="h-5 w-5 text-red-400" />;
}

function SeverityPill({ severity }: { severity: "critical" | "high" | "medium" | "low" }): React.JSX.Element {
  const classes: Record<typeof severity, string> = {
    critical: "bg-red-600/20 text-red-300 border-red-600/30",
    high: "bg-orange-500/20 text-orange-200 border-orange-500/30",
    medium: "bg-amber-500/20 text-amber-200 border-amber-500/30",
    low: "bg-blue-500/20 text-blue-200 border-blue-500/30"
  };

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${classes[severity]}`}>
      {severity}
    </span>
  );
}

export function ComplianceReport({ report }: ComplianceReportProps): React.JSX.Element {
  return (
    <section className="rounded-2xl border border-[#30363d] bg-[#111827] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">Compliance Report</p>
          <div className="mt-1 flex items-center gap-2 text-slate-100">
            <VerdictIcon verdict={report.verdict} />
            <h3 className="text-xl font-semibold">
              Score {report.score}/100 · {report.verdict.replace("-", " ")}
            </h3>
          </div>
          <p className="mt-2 text-sm text-slate-300">{report.summary}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {report.issues.length === 0 ? (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            No critical issues were detected in this run. Keep consent logging and rescans active.
          </div>
        ) : (
          report.issues.map((issue) => (
            <article key={issue.id} className="rounded-lg border border-[#2a3441] bg-[#0b1220] p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-slate-100">{issue.title}</h4>
                <SeverityPill severity={issue.severity} />
              </div>
              <p className="mt-2 text-sm text-slate-300">{issue.description}</p>
              <p className="mt-2 text-xs text-slate-400">Reference: {issue.regulationReference}</p>
              <div className="mt-3 rounded-md border border-[#2f81f7]/30 bg-[#2f81f7]/10 p-2 text-xs text-slate-200">
                <p className="inline-flex items-center gap-2 font-semibold text-[#8bc5ff]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Recommended Fix
                </p>
                <p className="mt-1">{issue.fix}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
