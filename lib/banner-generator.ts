import { BannerConfig, GeneratedBanner, ComplianceReport } from "@/lib/types";

export function generateBanner(
  report: ComplianceReport,
  config: BannerConfig
): GeneratedBanner {
  const primary = config.primaryColor ?? "#2f81f7";

  const html = `<div id="gdpr-cookie-banner" class="gdpr-cookie-banner" role="dialog" aria-label="Cookie consent" aria-live="polite">
  <div class="gdpr-cookie-banner__content">
    <h3>Cookie Preferences</h3>
    <p>${config.companyName} uses cookies to run the site securely, measure performance, and personalize content only when you allow it.</p>
    <div class="gdpr-cookie-banner__links">
      <a href="${config.privacyPolicyUrl}" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
      <a href="${config.cookiePolicyUrl}" target="_blank" rel="noopener noreferrer">Cookie Policy</a>
    </div>
    <div class="gdpr-cookie-banner__categories">
      <label><input type="checkbox" checked disabled /> Essential (always on)</label>
      <label><input type="checkbox" id="gdpr-analytics" /> Analytics</label>
      <label><input type="checkbox" id="gdpr-marketing" /> Marketing</label>
    </div>
    <div class="gdpr-cookie-banner__actions">
      <button id="gdpr-reject" type="button">Reject Non-Essential</button>
      <button id="gdpr-save" type="button">Save Preferences</button>
      <button id="gdpr-accept" type="button">Accept All</button>
    </div>
  </div>
</div>`;

  const css = `.gdpr-cookie-banner {
  position: fixed;
  inset: auto 1rem 1rem 1rem;
  z-index: 9999;
  max-width: 760px;
  margin: 0 auto;
  background: #111827;
  border: 1px solid #2a3441;
  border-radius: 12px;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
  color: #f8fafc;
  font-family: Inter, system-ui, sans-serif;
}
.gdpr-cookie-banner__content {
  padding: 1rem;
}
.gdpr-cookie-banner__content h3 {
  margin: 0 0 0.5rem;
}
.gdpr-cookie-banner__content p {
  margin: 0 0 0.75rem;
  line-height: 1.45;
}
.gdpr-cookie-banner__links {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.gdpr-cookie-banner__links a {
  color: ${primary};
  font-weight: 600;
}
.gdpr-cookie-banner__categories {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
}
.gdpr-cookie-banner__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.gdpr-cookie-banner__actions button {
  border-radius: 8px;
  border: 1px solid #334155;
  background: #0b1220;
  color: #f8fafc;
  font-weight: 600;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
}
.gdpr-cookie-banner__actions #gdpr-accept {
  background: ${primary};
  border-color: ${primary};
}
@media (max-width: 680px) {
  .gdpr-cookie-banner {
    inset: auto 0.75rem 0.75rem 0.75rem;
  }
}`;

  const javascript = `(() => {
  const key = "gdpr_cookie_choices";
  const banner = document.getElementById("gdpr-cookie-banner");
  if (!banner) return;

  const existing = localStorage.getItem(key);
  if (existing) {
    banner.remove();
    return;
  }

  const analytics = document.getElementById("gdpr-analytics");
  const marketing = document.getElementById("gdpr-marketing");
  const accept = document.getElementById("gdpr-accept");
  const reject = document.getElementById("gdpr-reject");
  const save = document.getElementById("gdpr-save");

  const persist = (choices) => {
    localStorage.setItem(key, JSON.stringify({ ...choices, storedAt: new Date().toISOString() }));
    document.cookie = "cookie_consent=" + encodeURIComponent(JSON.stringify(choices)) + "; path=/; max-age=" + (60 * 60 * 24 * 365);
    banner.remove();
  };

  accept?.addEventListener("click", () => persist({ essential: true, analytics: true, marketing: true }));
  reject?.addEventListener("click", () => persist({ essential: true, analytics: false, marketing: false }));
  save?.addEventListener("click", () => persist({ essential: true, analytics: !!analytics?.checked, marketing: !!marketing?.checked }));
})();`;

  const implementationChecklist = [
    "Place the HTML snippet directly before the closing </body> tag.",
    "Load CSS in your global stylesheet or inject in a dedicated consent stylesheet.",
    "Run the JavaScript after page load and gate analytics/ads scripts behind saved choices.",
    `Review and address ${report.issues.length} compliance issue(s) identified in this scan before going live.`
  ];

  return {
    html,
    css,
    javascript,
    implementationChecklist
  };
}
