"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { ScanForm } from "@/components/ScanForm";
import { ComplianceReport } from "@/components/ComplianceReport";
import { CookieBannerGenerator } from "@/components/CookieBannerGenerator";
import type { ComplianceReport as ComplianceReportType, ScanResult } from "@/lib/types";

type ScanApiResponse = {
  scanResult: ScanResult;
  report: ComplianceReportType;
};

export function ScanWorkspace(): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ScanApiResponse | null>(null);

  async function onScan(url: string): Promise<void> {
    setLoading(true);
    setError("");

    const response = await fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    });

    const payload = (await response.json()) as ScanApiResponse & { error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Scan failed. Try again in a moment.");
      setLoading(false);
      return;
    }

    setData(payload);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <ScanForm onScan={onScan} loading={loading} />

      {error && (
        <div className="rounded-lg border border-red-600/40 bg-red-600/10 p-3 text-sm text-red-200">
          <p className="inline-flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4" />
            Scan Error
          </p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {data && (
        <>
          <ComplianceReport report={data.report} />
          <CookieBannerGenerator report={data.report} domain={data.scanResult.url} />
        </>
      )}
    </div>
  );
}
