import type { Metadata } from "next";
import { Space_Grotesk, Source_Sans_3, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const bodyFont = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gdpr-cookie-audit.vercel.app"),
  title: "GDPR Cookie Audit | Automated Cookie Compliance Scanner",
  description:
    "Scan your site for GDPR cookie compliance gaps, get legal-focused risk reports, and generate a compliant consent banner in minutes.",
  keywords: [
    "GDPR cookie compliance",
    "cookie scanner",
    "cookie consent banner",
    "ePrivacy audit",
    "small business compliance"
  ],
  openGraph: {
    title: "GDPR Cookie Audit",
    description:
      "Automated GDPR cookie compliance scanner with actionable fixes and compliant banner generation.",
    type: "website",
    url: "https://gdpr-cookie-audit.vercel.app",
    siteName: "GDPR Cookie Audit"
  },
  twitter: {
    card: "summary_large_image",
    title: "GDPR Cookie Audit",
    description:
      "Automated GDPR cookie compliance scanner for EU small businesses. Detect risks and generate compliant fixes fast."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body className={`${headingFont.variable} ${bodyFont.variable} bg-[#0d1117] text-slate-100`}>
        {children}
      </body>
    </html>
  );
}
