import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import { normalizeUrl } from "@/lib/utils";
import type { CookieRecord, ScanResult, ScriptRecord } from "@/lib/types";

const KNOWN_TRACKERS: Array<{ name: string; match: RegExp }> = [
  { name: "Google Analytics", match: /google-analytics\.com|gtag\/js|ga\(/i },
  { name: "Google Ads", match: /googletagmanager\.com|doubleclick\.net/i },
  { name: "Meta Pixel", match: /connect\.facebook\.net|fbq\(/i },
  { name: "Hotjar", match: /hotjar\.com|hj\(/i },
  { name: "Microsoft Clarity", match: /clarity\.ms/i },
  { name: "LinkedIn Insight", match: /snap\.licdn\.com/i },
  { name: "TikTok Pixel", match: /analytics\.tiktok\.com/i }
];

function guessScriptPurpose(source: string): ScriptRecord["purposeGuess"] {
  if (/analytics|gtag|ga\(|mixpanel|matomo/i.test(source)) return "analytics";
  if (/doubleclick|facebook|ads|remarketing|tiktok/i.test(source)) return "advertising";
  if (/consent|cookie|essential|security|csrf/i.test(source)) return "essential";
  return "unknown";
}

function parseSetCookieHeader(setCookie: string): CookieRecord | null {
  const parts = setCookie.split(";").map((part) => part.trim());
  const [nameValue, ...attributes] = parts;
  const [name, value] = nameValue.split("=");
  if (!name) {
    return null;
  }

  const record: CookieRecord = {
    name,
    valuePreview: (value ?? "").slice(0, 16),
    source: "header"
  };

  for (const attribute of attributes) {
    const [keyRaw, valueRaw] = attribute.split("=");
    const key = keyRaw.toLowerCase();
    const valueAttr = valueRaw?.trim();
    if (key === "domain") record.domain = valueAttr;
    if (key === "path") record.path = valueAttr;
    if (key === "expires" && valueAttr) record.expires = Date.parse(valueAttr);
    if (key === "secure") record.secure = true;
    if (key === "httponly") record.httpOnly = true;
    if (key === "samesite") record.sameSite = valueAttr;
  }

  return record;
}

function dedupeCookies(records: CookieRecord[]): CookieRecord[] {
  const map = new Map<string, CookieRecord>();
  for (const record of records) {
    const key = `${record.name}:${record.domain ?? ""}:${record.path ?? ""}`;
    if (!map.has(key)) {
      map.set(key, record);
    }
  }
  return Array.from(map.values());
}

function parseHtmlSignals(html: string): {
  scripts: ScriptRecord[];
  bannerDetected: boolean;
  rejectButtonDetected: boolean;
  granularControlsDetected: boolean;
  policyLinkDetected: boolean;
  trackers: string[];
} {
  const $ = cheerio.load(html);

  const scripts: ScriptRecord[] = [];
  const trackers = new Set<string>();

  $("script").each((_, element) => {
    const src = $(element).attr("src");
    const inline = ($(element).html() ?? "").trim();
    const source = `${src ?? ""}\n${inline.slice(0, 240)}`;

    scripts.push({
      src,
      inlineSnippet: inline ? inline.slice(0, 180) : undefined,
      purposeGuess: guessScriptPurpose(source)
    });

    for (const tracker of KNOWN_TRACKERS) {
      if (tracker.match.test(source)) {
        trackers.add(tracker.name);
      }
    }
  });

  const bodyText = $("body").text().toLowerCase();

  const bannerDetected =
    /cookie consent|we use cookies|cookie preferences|cookie settings/.test(bodyText) ||
    $("[id*='cookie'], [class*='cookie'], [data-cookie], [aria-label*='cookie']").length > 0;

  const rejectButtonDetected =
    /reject all|decline|necessary only|refuse/.test(bodyText) ||
    $("button, a").toArray().some((node) => {
      const text = $(node).text().toLowerCase();
      return /reject|decline|necessary/i.test(text);
    });

  const granularControlsDetected =
    /analytics|marketing|preferences|functional/.test(bodyText) &&
    /save preferences|manage preferences|customize/.test(bodyText);

  const policyLinkDetected =
    $("a[href*='privacy'], a[href*='cookie-policy'], a[href*='cookies']").length > 0;

  return {
    scripts,
    bannerDetected,
    rejectButtonDetected,
    granularControlsDetected,
    policyLinkDetected,
    trackers: Array.from(trackers)
  };
}

async function scanWithPuppeteer(url: string): Promise<ScanResult> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  const headersCookies: CookieRecord[] = [];

  page.on("response", (response) => {
    const headerValue = response.headers()["set-cookie"];
    if (!headerValue) {
      return;
    }

    const headerCookies = headerValue
      .split(/,(?=[^;]+=[^;]+)/)
      .map((entry) => parseSetCookieHeader(entry))
      .filter((entry): entry is CookieRecord => entry !== null);

    headersCookies.push(...headerCookies);
  });

  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: 45000
  });

  const html = await page.content();
  const browserCookies = (await page.cookies()).map<CookieRecord>((cookie) => ({
    name: cookie.name,
    valuePreview: cookie.value.slice(0, 16),
    domain: cookie.domain,
    path: cookie.path,
    expires: cookie.expires,
    secure: cookie.secure,
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    source: "browser"
  }));

  const htmlSignals = parseHtmlSignals(html);

  await browser.close();

  return {
    url,
    scannedAt: new Date().toISOString(),
    bannerDetected: htmlSignals.bannerDetected,
    rejectButtonDetected: htmlSignals.rejectButtonDetected,
    granularControlsDetected: htmlSignals.granularControlsDetected,
    policyLinkDetected: htmlSignals.policyLinkDetected,
    cookies: dedupeCookies([...browserCookies, ...headersCookies]),
    scriptSignals: htmlSignals.scripts,
    trackersDetected: htmlSignals.trackers,
    notes: []
  };
}

async function scanWithCheerioFallback(url: string): Promise<ScanResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; GDPRCookieAudit/1.0; +https://example.com)"
    }
  });

  const html = await response.text();
  const htmlSignals = parseHtmlSignals(html);

  const setCookieHeader = response.headers.get("set-cookie");
  const cookiesFromHeaders = setCookieHeader
    ? setCookieHeader
        .split(/,(?=[^;]+=[^;]+)/)
        .map((entry) => parseSetCookieHeader(entry))
        .filter((entry): entry is CookieRecord => entry !== null)
    : [];

  return {
    url,
    scannedAt: new Date().toISOString(),
    bannerDetected: htmlSignals.bannerDetected,
    rejectButtonDetected: htmlSignals.rejectButtonDetected,
    granularControlsDetected: htmlSignals.granularControlsDetected,
    policyLinkDetected: htmlSignals.policyLinkDetected,
    cookies: dedupeCookies(cookiesFromHeaders),
    scriptSignals: htmlSignals.scripts,
    trackersDetected: htmlSignals.trackers,
    notes: [
      "Browser-level cookie scan was unavailable, so results are based on server response headers and HTML analysis."
    ]
  };
}

export async function scanWebsite(inputUrl: string): Promise<ScanResult> {
  const url = normalizeUrl(inputUrl);

  try {
    return await scanWithPuppeteer(url);
  } catch (error) {
    const fallback = await scanWithCheerioFallback(url);
    fallback.notes.push(
      `Puppeteer scan fallback used: ${error instanceof Error ? error.message : "unknown error"}`
    );
    return fallback;
  }
}
