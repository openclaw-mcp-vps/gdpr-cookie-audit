import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClaimAccessForm } from "@/components/ClaimAccessForm";

export function PaywallCard(): React.JSX.Element {
  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "#";

  return (
    <Card className="mx-auto max-w-xl bg-[#0f1724]">
      <CardHeader>
        <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1f2a3d] text-[#58a6ff]">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl">Compliance Scanner Is Behind The Paywall</CardTitle>
        <CardDescription>
          Purchase access with Stripe and unlock the full scanner, report dashboard, and compliant banner generator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link
          href={stripeLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-md bg-[#2f81f7] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f6feb]"
        >
          Buy For $19/mo
        </Link>
        <div className="mt-4 rounded-md border border-[#2a3441] bg-[#0b1220] p-3 text-xs text-slate-300">
          <p className="flex items-center gap-2 font-medium text-slate-200">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Already paid?
          </p>
          <p className="mt-1">
            Enter the same email used at checkout. If your Stripe webhook has reached this app, your access cookie is
            issued instantly.
          </p>
          <ClaimAccessForm />
        </div>
      </CardContent>
    </Card>
  );
}
