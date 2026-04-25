import { NextResponse } from "next/server";
import { z } from "zod";
import { findActivePurchaseByEmail } from "@/lib/database";
import { getAccessCookieMaxAge, getAccessCookieName, signAccessToken } from "@/lib/access";

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: Request): Promise<NextResponse> {
  const json = (await request.json()) as unknown;
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide a valid purchase email." }, { status: 400 });
  }

  const purchase = await findActivePurchaseByEmail(parsed.data.email);

  if (!purchase) {
    return NextResponse.json(
      {
        error:
          "No active purchase found for that email yet. If you paid moments ago, wait 30 seconds for webhook processing."
      },
      { status: 403 }
    );
  }

  const token = await signAccessToken(purchase.email);
  const response = NextResponse.json({ message: "Access unlocked. You can now use the scanner and dashboard." });

  response.cookies.set({
    name: getAccessCookieName(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: getAccessCookieMaxAge(),
    path: "/"
  });

  return response;
}
