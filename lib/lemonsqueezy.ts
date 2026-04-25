import crypto from "node:crypto";
import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";
import type { PurchaseRecord } from "@/lib/types";

// Optional setup so the official SDK can be used if LemonSqueezy webhooks are enabled.
if (process.env.LEMONSQUEEZY_API_KEY) {
  lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY });
}

type StripeCheckoutCompleted = {
  type: "checkout.session.completed";
  data: {
    object: {
      id: string;
      customer_details?: {
        email?: string;
      };
      customer_email?: string;
      payment_status?: string;
    };
  };
};

type StripeCheckoutExpired = {
  type: "checkout.session.expired";
  data: {
    object: {
      id: string;
      customer_details?: {
        email?: string;
      };
      customer_email?: string;
    };
  };
};

type StripeWebhookEvent = StripeCheckoutCompleted | StripeCheckoutExpired;

export function verifyStripeSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return false;
  }

  const entries = signature.split(",").map((item) => item.trim());
  const timestamp = entries.find((item) => item.startsWith("t="))?.slice(2);
  const signatureV1 = entries.find((item) => item.startsWith("v1="))?.slice(3);

  if (!timestamp || !signatureV1) {
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET)
    .update(signedPayload, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(signatureV1, "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

export function parseStripeWebhook(rawBody: string): PurchaseRecord | null {
  const parsed = JSON.parse(rawBody) as StripeWebhookEvent;

  if (parsed.type === "checkout.session.completed") {
    const email =
      parsed.data.object.customer_details?.email ?? parsed.data.object.customer_email ?? "";

    if (!email || parsed.data.object.payment_status !== "paid") {
      return null;
    }

    return {
      email,
      source: "stripe",
      createdAt: new Date().toISOString(),
      externalId: parsed.data.object.id,
      status: "active"
    };
  }

  if (parsed.type === "checkout.session.expired") {
    return null;
  }

  return null;
}

export function verifyLemonSqueezySignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return false;
  }

  const digest = crypto
    .createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET)
    .update(rawBody, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(digest, "utf8");
  const providedBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

export function parseLemonSqueezyWebhook(rawBody: string): PurchaseRecord | null {
  const parsed = JSON.parse(rawBody) as {
    meta?: { event_name?: string };
    data?: {
      id?: string;
      attributes?: {
        user_email?: string;
      };
    };
  };

  if (parsed.meta?.event_name !== "order_created") {
    return null;
  }

  const email = parsed.data?.attributes?.user_email;
  if (!email) {
    return null;
  }

  return {
    email,
    source: "lemonsqueezy",
    createdAt: new Date().toISOString(),
    externalId: parsed.data?.id ?? crypto.randomUUID(),
    status: "active"
  };
}
