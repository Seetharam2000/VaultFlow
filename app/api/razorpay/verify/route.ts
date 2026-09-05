import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json({ error: "Razorpay server credentials are not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const orderId = typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : "";
    const paymentId = typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
    const signature = typeof body.razorpay_signature === "string" ? body.razorpay_signature : "";
    const expectedSignature = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");

    const valid = signature.length === expectedSignature.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    if (!valid) return NextResponse.json({ error: "Payment signature could not be verified." }, { status: 400 });

    return NextResponse.json({ verified: true });
  } catch {
    return NextResponse.json({ error: "Unable to verify Razorpay payment." }, { status: 400 });
  }
}
