"use client";

import { useState } from "react";
import { Copy, WandSparkles } from "lucide-react";
import type { ComplianceReport as ComplianceReportType, GeneratedBanner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CookieBannerGeneratorProps = {
  report: ComplianceReportType;
  domain: string;
};

export function CookieBannerGenerator({ report, domain }: CookieBannerGeneratorProps): React.JSX.Element {
  const [banner, setBanner] = useState<GeneratedBanner | null>(null);
  const [companyName, setCompanyName] = useState(domain.replace(/^https?:\/\//, "").split("/")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate(): Promise<void> {
    setLoading(true);
    setError("");

    const response = await fetch("/api/generate-banner", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        companyName,
        domain,
        report
      })
    });

    const data = (await response.json()) as { banner?: GeneratedBanner; error?: string };

    if (!response.ok || !data.banner) {
      setError(data.error ?? "Unable to generate a banner right now.");
      setLoading(false);
      return;
    }

    setBanner(data.banner);
    setLoading(false);
  }

  async function copy(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
  }

  return (
    <section className="rounded-2xl border border-[#30363d] bg-[#111827] p-4 sm:p-6">
      <div className="flex items-center gap-2 text-slate-100">
        <WandSparkles className="h-5 w-5 text-[#58a6ff]" />
        <h3 className="text-lg font-semibold">Generate Compliant Cookie Banner</h3>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Generate implementation-ready HTML, CSS, and JS matched to your scan findings.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Company name" />
        <Button onClick={generate} type="button" disabled={loading}>
          {loading ? "Generating..." : "Generate Banner Code"}
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {banner && (
        <div className="mt-5 grid gap-4">
          {[
            { label: "HTML", value: banner.html },
            { label: "CSS", value: banner.css },
            { label: "JavaScript", value: banner.javascript }
          ].map((section) => (
            <div key={section.label} className="rounded-lg border border-[#2a3441] bg-[#0b1220] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-200">{section.label}</p>
                <Button variant="secondary" size="sm" type="button" onClick={() => copy(section.value)}>
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>
              <pre className="max-h-80 overflow-auto rounded-md border border-[#1f2a3d] bg-[#0a101b] p-3 text-xs text-slate-300">
                <code>{section.value}</code>
              </pre>
            </div>
          ))}
          <div className="rounded-lg border border-[#2a3441] bg-[#0b1220] p-3">
            <p className="text-sm font-semibold text-slate-200">Implementation Checklist</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-300">
              {banner.implementationChecklist.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
