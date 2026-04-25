import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { scanWebsite } from "@/lib/cookie-scanner";
import { analyzeGdprCompliance } from "@/lib/gdpr-analyzer";
import { getAccessFromCookie } from "@/lib/access";
import { saveScanHistory } from "@/lib/database";

export const runtime = "nodejs";

const schema = z.object({
  url: z.string().min(4)
});

export async function POST(request: Request): Promise<NextResponse> {
  const access = await getAccessFromCookie();
  if (!access) {
    return NextResponse.json({ error: "Active subscription required." }, { status: 403 });
  }

  const body = (await request.json()) as unknown;
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "A valid URL is required." }, { status: 400 });
  }

  try {
    const scanResult = await scanWebsite(parsed.data.url);
    const report = analyzeGdprCompliance(scanResult);

    const issuesBySeverity = report.issues.reduce(
      (acc, issue) => {
        acc[issue.severity] += 1;
        return acc;
      },
      { critical: 0, high: 0, medium: 0, low: 0 }
    );

    await saveScanHistory({
      id: crypto.randomUUID(),
      ownerEmail: access.email,
      createdAt: new Date().toISOString(),
      domain: new URL(scanResult.url).hostname,
      score: report.score,
      issuesBySeverity
    });

    return NextResponse.json({ scanResult, report });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Scan failed: ${error instanceof Error ? error.message : "unknown error"}`
      },
      { status: 500 }
    );
  }
}
