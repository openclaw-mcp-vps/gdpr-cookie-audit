import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Website URL is required");
  }

  const withProtocol = /^(http|https):\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  const url = new URL(withProtocol);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported");
  }

  return url.toString();
}

export function severityWeight(severity: "critical" | "high" | "medium" | "low"): number {
  if (severity === "critical") return 28;
  if (severity === "high") return 18;
  if (severity === "medium") return 10;
  return 5;
}
