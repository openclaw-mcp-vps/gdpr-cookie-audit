"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ScanHistoryRecord } from "@/lib/types";

type DashboardChartsProps = {
  history: ScanHistoryRecord[];
};

const COLORS = {
  critical: "#ff6b6b",
  high: "#ff9f43",
  medium: "#feca57",
  low: "#54a0ff"
};

export function DashboardCharts({ history }: DashboardChartsProps): React.JSX.Element {
  const recent = history.slice(0, 8).reverse();

  const scoreSeries = recent.map((item) => ({
    date: new Date(item.createdAt).toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
    score: item.score
  }));

  const severityTotals = history.reduce(
    (acc, item) => {
      acc.critical += item.issuesBySeverity.critical;
      acc.high += item.issuesBySeverity.high;
      acc.medium += item.issuesBySeverity.medium;
      acc.low += item.issuesBySeverity.low;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );

  const pieData = [
    { name: "Critical", value: severityTotals.critical, color: COLORS.critical },
    { name: "High", value: severityTotals.high, color: COLORS.high },
    { name: "Medium", value: severityTotals.medium, color: COLORS.medium },
    { name: "Low", value: severityTotals.low, color: COLORS.low }
  ].filter((item) => item.value > 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-[#30363d] bg-[#111827] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Compliance Score Trend</h3>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreSeries}>
              <CartesianGrid stroke="#2a3441" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#8b949e" />
              <YAxis stroke="#8b949e" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: "#0f1724", border: "1px solid #2a3441", borderRadius: "10px" }}
                labelStyle={{ color: "#c9d1d9" }}
                itemStyle={{ color: "#8bc5ff" }}
              />
              <Bar dataKey="score" fill="#2f81f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl border border-[#30363d] bg-[#111827] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Issue Severity Mix</h3>
        <div className="mt-3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#0f1724", border: "1px solid #2a3441", borderRadius: "10px" }}
                labelStyle={{ color: "#c9d1d9" }}
                itemStyle={{ color: "#8bc5ff" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
