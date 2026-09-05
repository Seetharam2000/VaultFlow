import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Razorpay server credentials are not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const amount = Number(body.amount);
    const action = typeof body.action === "string" ? body.action : "VaultFlow payment";
    const recipient = typeof body.recipient === "string" ? body.recipient : "customer";

    if (!Number.isFinite(amount) || amount < 1) {
      return NextResponse.json({ error: "A valid payment amount is required." }, { status: 400 });
    }

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `yieldpulse_${Date.now()}`,
        notes: { action, recipient },
      }),
    });

    const result = await razorpayResponse.json();
    if (!razorpayResponse.ok) {
      return NextResponse.json({ error: result.error?.description || "Razorpay could not create the order." }, { status: razorpayResponse.status });
    }

    return NextResponse.json({ id: result.id, amount: result.amount, currency: result.currency });
  } catch {
    return NextResponse.json({ error: "Unable to create Razorpay order." }, { status: 500 });
  }
}
