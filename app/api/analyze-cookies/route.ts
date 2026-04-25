import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeGdprCompliance } from "@/lib/gdpr-analyzer";
import { getAccessFromCookie } from "@/lib/access";
import type { ScanResult } from "@/lib/types";

const schema = z.object({
  scanResult: z.object({
    url: z.string(),
    scannedAt: z.string(),
    bannerDetected: z.boolean(),
    rejectButtonDetected: z.boolean(),
    granularControlsDetected: z.boolean(),
    policyLinkDetected: z.boolean(),
    cookies: z.array(
      z.object({
        name: z.string(),
        valuePreview: z.string(),
        domain: z.string().optional(),
        path: z.string().optional(),
        expires: z.number().optional(),
        httpOnly: z.boolean().optional(),
        secure: z.boolean().optional(),
        sameSite: z.string().optional(),
        source: z.enum(["browser", "header", "html"])
      })
    ),
    scriptSignals: z.array(
      z.object({
        src: z.string().optional(),
        inlineSnippet: z.string().optional(),
        purposeGuess: z.enum(["analytics", "advertising", "essential", "unknown"])
      })
    ),
    trackersDetected: z.array(z.string()),
    notes: z.array(z.string())
  })
});

export async function POST(request: Request): Promise<NextResponse> {
  const access = await getAccessFromCookie();
  if (!access) {
    return NextResponse.json({ error: "Active subscription required." }, { status: 403 });
  }

  const body = (await request.json()) as unknown;
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid scan payload." }, { status: 400 });
  }

  const report = analyzeGdprCompliance(parsed.data.scanResult as ScanResult);
  return NextResponse.json({ report });
}
