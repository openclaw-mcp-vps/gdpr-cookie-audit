export type CookieRecord = {
  name: string;
  valuePreview: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: string;
  source: "browser" | "header" | "html";
};

export type ScriptRecord = {
  src?: string;
  inlineSnippet?: string;
  purposeGuess: "analytics" | "advertising" | "essential" | "unknown";
};

export type ScanResult = {
  url: string;
  scannedAt: string;
  bannerDetected: boolean;
  rejectButtonDetected: boolean;
  granularControlsDetected: boolean;
  policyLinkDetected: boolean;
  cookies: CookieRecord[];
  scriptSignals: ScriptRecord[];
  trackersDetected: string[];
  notes: string[];
};

export type ComplianceIssue = {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  regulationReference: string;
  fix: string;
};

export type ComplianceReport = {
  score: number;
  verdict: "compliant" | "at-risk" | "non-compliant";
  issues: ComplianceIssue[];
  requiredBannerCapabilities: string[];
  summary: string;
};

export type BannerConfig = {
  companyName: string;
  primaryColor?: string;
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
  enableGranularControls: boolean;
  essentialCookiesDescription: string;
  analyticsCookiesDescription: string;
  marketingCookiesDescription: string;
};

export type GeneratedBanner = {
  html: string;
  css: string;
  javascript: string;
  implementationChecklist: string[];
};

export type PurchaseRecord = {
  email: string;
  source: "stripe" | "lemonsqueezy";
  createdAt: string;
  externalId: string;
  status: "active" | "refunded";
};

export type ScanHistoryRecord = {
  id: string;
  ownerEmail: string;
  createdAt: string;
  domain: string;
  score: number;
  issuesBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
};
