import { NextResponse } from "next/server";
import { upsertPurchase } from "@/lib/database";
import {
  parseLemonSqueezyWebhook,
  parseStripeWebhook,
  verifyLemonSqueezySignature,
  verifyStripeSignature
} from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const rawBody = await request.text();
  const stripeSignature = request.headers.get("stripe-signature");
  const lemonSignature = request.headers.get("x-signature");

  if (stripeSignature) {
    if (!verifyStripeSignature(rawBody, stripeSignature)) {
      return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 401 });
    }

    const purchase = parseStripeWebhook(rawBody);
    if (purchase) {
      await upsertPurchase(purchase);
    }

    return NextResponse.json({ ok: true, source: "stripe" });
  }

  if (lemonSignature) {
    if (!verifyLemonSqueezySignature(rawBody, lemonSignature)) {
      return NextResponse.json({ error: "Invalid LemonSqueezy signature." }, { status: 401 });
    }

    const purchase = parseLemonSqueezyWebhook(rawBody);
    if (purchase) {
      await upsertPurchase(purchase);
    }

    return NextResponse.json({ ok: true, source: "lemonsqueezy" });
  }

  return NextResponse.json(
    {
      error: "Unsupported webhook signature header."
    },
    { status: 400 }
  );
}
