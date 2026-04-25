import { ComplianceReport, ComplianceIssue, ScanResult } from "@/lib/types";
import { severityWeight } from "@/lib/utils";

const NON_ESSENTIAL_COOKIE_HINTS = [
  /_ga/i,
  /_gid/i,
  /_gat/i,
  /_fbp/i,
  /fr/i,
  /ad/i,
  /pixel/i,
  /track/i
];

function hasNonEssentialCookies(result: ScanResult): boolean {
  return result.cookies.some((cookie) => NON_ESSENTIAL_COOKIE_HINTS.some((pattern) => pattern.test(cookie.name)));
}

function buildIssue(
  id: string,
  title: string,
  severity: ComplianceIssue["severity"],
  description: string,
  regulationReference: string,
  fix: string
): ComplianceIssue {
  return {
    id,
    title,
    severity,
    description,
    regulationReference,
    fix
  };
}

export function analyzeGdprCompliance(result: ScanResult): ComplianceReport {
  const issues: ComplianceIssue[] = [];

  if (!result.bannerDetected) {
    issues.push(
      buildIssue(
        "missing-banner",
        "Cookie consent banner is missing",
        "critical",
        "No visible consent mechanism was detected before tracking scripts and cookies are likely loaded.",
        "ePrivacy Directive Art. 5(3), GDPR Art. 6(1)(a)",
        "Add a consent banner that blocks non-essential cookies until explicit opt-in."
      )
    );
  }

  if (!result.rejectButtonDetected) {
    issues.push(
      buildIssue(
        "missing-reject",
        "No one-click reject option detected",
        "high",
        "Users must be able to reject non-essential cookies as easily as accepting them.",
        "EDPB Guidelines 05/2020 on consent",
        "Add a clear 'Reject non-essential cookies' button on the first layer of the banner."
      )
    );
  }

  if (!result.granularControlsDetected) {
    issues.push(
      buildIssue(
        "missing-granular",
        "Granular cookie category controls not detected",
        "medium",
        "GDPR-compliant consent usually requires category-level controls for analytics and marketing cookies.",
        "GDPR Art. 7 and Art. 5(1)(a)",
        "Add category toggles for essential, analytics, and marketing cookies."
      )
    );
  }

  if (!result.policyLinkDetected) {
    issues.push(
      buildIssue(
        "missing-policy-link",
        "Privacy or cookie policy link missing from consent UX",
        "medium",
        "Users must have clear, accessible information about cookie purposes and storage duration.",
        "GDPR Art. 12, Art. 13",
        "Add direct links to privacy and cookie policy documents in the banner."
      )
    );
  }

  if (result.trackersDetected.length > 0 && !result.bannerDetected) {
    issues.push(
      buildIssue(
        "trackers-before-consent",
        "Tracking scripts appear active before valid consent",
        "critical",
        `Detected tracker signals: ${result.trackersDetected.join(", ")}. These are likely loaded before user consent.`,
        "GDPR Art. 6(1)(a), ePrivacy Directive Art. 5(3)",
        "Delay loading analytics/marketing scripts until explicit consent is granted."
      )
    );
  }

  if (hasNonEssentialCookies(result) && !result.bannerDetected) {
    issues.push(
      buildIssue(
        "non-essential-cookies-before-consent",
        "Likely non-essential cookies set before opt-in",
        "high",
        "Cookie names indicate analytics or advertising usage without prior validated consent.",
        "CNIL and DPA enforcement guidance",
        "Block non-essential cookies by default and set them only after opt-in."
      )
    );
  }

  const penalty = issues.reduce((sum, issue) => sum + severityWeight(issue.severity), 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));

  const verdict: ComplianceReport["verdict"] =
    score >= 85 ? "compliant" : score >= 60 ? "at-risk" : "non-compliant";

  const requiredBannerCapabilities = [
    "Explicit Accept and Reject actions on the first layer",
    "Category-level consent toggles for analytics and marketing",
    "Consent log with timestamp and consent choices",
    "Deferred loading for analytics/ads scripts until consent",
    "Persistent 'Change cookie settings' link in footer"
  ];

  const summary =
    verdict === "compliant"
      ? "This site is close to GDPR cookie compliance. Keep consent logging and periodic rescans in place."
      : verdict === "at-risk"
        ? "This site has material consent UX and policy disclosure gaps that can trigger regulator attention."
        : "This site is currently exposed to GDPR/ePrivacy enforcement risk due to missing or invalid consent controls.";

  return {
    score,
    verdict,
    issues,
    requiredBannerCapabilities,
    summary
  };
}
