import { NextResponse } from "next/server";
import { z } from "zod";
import { generateBanner } from "@/lib/banner-generator";
import { getAccessFromCookie } from "@/lib/access";
import type { ComplianceReport } from "@/lib/types";

const schema = z.object({
  companyName: z.string().min(2),
  domain: z.string().url(),
  report: z.object({
    score: z.number(),
    verdict: z.enum(["compliant", "at-risk", "non-compliant"]),
    issues: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        severity: z.enum(["critical", "high", "medium", "low"]),
        description: z.string(),
        regulationReference: z.string(),
        fix: z.string()
      })
    ),
    requiredBannerCapabilities: z.array(z.string()),
    summary: z.string()
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
    return NextResponse.json({ error: "Invalid banner generation input." }, { status: 400 });
  }

  const privacyPolicyUrl = new URL("/privacy-policy", parsed.data.domain).toString();
  const cookiePolicyUrl = new URL("/cookie-policy", parsed.data.domain).toString();

  const banner = generateBanner(parsed.data.report as ComplianceReport, {
    companyName: parsed.data.companyName,
    privacyPolicyUrl,
    cookiePolicyUrl,
    enableGranularControls: true,
    primaryColor: "#2f81f7",
    essentialCookiesDescription: "Required for security, login sessions, and core site functionality.",
    analyticsCookiesDescription: "Used to understand site performance and improve user experience.",
    marketingCookiesDescription: "Used to measure ad effectiveness and personalize campaigns."
  });

  return NextResponse.json({ banner });
}
