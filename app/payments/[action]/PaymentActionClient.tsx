"use client";

import Script from "next/script";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, CircleHelp, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpayOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  prefill: { name: string; email: string; contact: string };
  notes: { action: string; recipient: string };
  theme: { color: string };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal: { ondismiss: () => void };
};

type ActionConfig = {
  title: string;
  eyebrow: string;
  description: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  amountLabel: string;
  buttonLabel: string;
  note: string;
};

type ActionOption = {
  id: string;
  title: string;
  detail: string;
  meta: string;
  recipient: string;
  amount: string;
};

const actionOptions: Record<string, ActionOption[]> = {
  "send-money": [
    { id: "hdfc", title: "HDFC Bank", detail: "Savings account ending 4821", meta: "Primary account", recipient: "HDFC Bank •••• 4821", amount: "" },
    { id: "icici", title: "ICICI Bank", detail: "Savings account ending 7310", meta: "UPI enabled", recipient: "ICICI Bank •••• 7310", amount: "" },
    { id: "axis", title: "Axis Bank", detail: "Current account ending 1094", meta: "IMPS enabled", recipient: "Axis Bank •••• 1094", amount: "" },
  ],
  "pay-bills": [
    { id: "electricity", title: "Electricity", detail: "BESCOM •••• 3281", meta: "Due 12 Sep", recipient: "BESCOM •••• 3281", amount: "2450" },
    { id: "mobile", title: "Mobile recharge", detail: "Jio •••• 8812", meta: "Prepaid plan", recipient: "Jio •••• 8812", amount: "599" },
    { id: "internet", title: "Internet", detail: "Airtel Xstream •••• 1940", meta: "Due 18 Sep", recipient: "Airtel Xstream •••• 1940", amount: "999" },
    { id: "water", title: "Water bill", detail: "BWSSB •••• 5042", meta: "Due 20 Sep", recipient: "BWSSB •••• 5042", amount: "780" },
  ],
  invest: [
    { id: "balanced", title: "Balanced Growth Fund", detail: "Steady long-term wealth creation", meta: "Moderate risk • 10.8% 3Y return", recipient: "Balanced Growth Fund", amount: "10000" },
    { id: "index", title: "Nifty 50 Index Fund", detail: "Low-cost equity index exposure", meta: "Moderately high risk • SIP from ₹500", recipient: "Nifty 50 Index Fund", amount: "5000" },
    { id: "gold", title: "Digital Gold", detail: "Diversify with 24K digital gold", meta: "Low to moderate risk • From ₹100", recipient: "Digital Gold", amount: "2500" },
  ],
  loans: [
    { id: "personal", title: "Personal loan", detail: "Up to ₹8 lakh with flexible use", meta: "12.5% p.a. • 36 months • EMI from ₹26,700", recipient: "Personal Loan application", amount: "2499" },
    { id: "home", title: "Home improvement loan", detail: "Fund renovations without touching savings", meta: "9.25% p.a. • 60 months • EMI from ₹20,900", recipient: "Home Improvement Loan application", amount: "1999" },
    { id: "business", title: "Business working capital", detail: "Keep day-to-day operations moving", meta: "14.0% p.a. • 24 months • EMI from ₹48,000", recipient: "Business Working Capital application", amount: "3499" },
  ],
  insurance: [
    { id: "health", title: "Health Protect Plus", detail: "₹10 lakh family health cover", meta: "Annual premium ₹12,480", recipient: "Health Protect Plus policy", amount: "12480" },
    { id: "life", title: "Life Secure Term", detail: "₹1 crore term life cover", meta: "Annual premium ₹9,600", recipient: "Life Secure Term policy", amount: "9600" },
    { id: "vehicle", title: "Vehicle Shield", detail: "Comprehensive car insurance", meta: "Annual premium ₹7,850", recipient: "Vehicle Shield policy", amount: "7850" },
  ],
  "tax-tools": [
    { id: "advance", title: "Advance income tax", detail: "Pay your next estimated instalment", meta: "Due 15 Sep 2026", recipient: "Advance income tax", amount: "25000" },
    { id: "self-assessment", title: "Self-assessment tax", detail: "Settle outstanding income tax liability", meta: "Use challan details after payment", recipient: "Self-assessment tax", amount: "18000" },
    { id: "gst", title: "GST payment", detail: "Pay your registered business GST", meta: "For the current filing period", recipient: "GST payment", amount: "32000" },
  ],
};

const actionConfigs: Record<string, ActionConfig> = {
  "send-money": {
    title: "Send money securely.",
    eyebrow: "UPI / IMPS",
    description: "Transfer funds to a bank account or UPI ID with a protected Razorpay checkout.",
    recipientLabel: "Recipient UPI ID or account",
    recipientPlaceholder: "name@upi or account number",
    amountLabel: "Amount to send",
    buttonLabel: "Continue to Razorpay",
    note: "Transfers are processed through Razorpay's secure payment gateway.",
  },
  "pay-bills": {
    title: "Clear your bills in one place.",
    eyebrow: "UTILITIES",
    description: "Pay electricity, internet, mobile, and other recurring bills without leaving YieldPulse.",
    recipientLabel: "Biller or account number",
    recipientPlaceholder: "Select a biller or enter account number",
    amountLabel: "Bill amount",
    buttonLabel: "Pay bill with Razorpay",
    note: "Keep your biller reference handy for payment reconciliation.",
  },
  invest: {
    title: "Put your money to work.",
    eyebrow: "FUNDS / SIP / GOLD",
    description: "Start an investment contribution with a simple, transparent checkout experience.",
    recipientLabel: "Investment plan",
    recipientPlaceholder: "e.g. Balanced Growth Fund",
    amountLabel: "Contribution amount",
    buttonLabel: "Invest with Razorpay",
    note: "Investment products are subject to market risk. Review the plan before paying.",
  },
  loans: {
    title: "Move your loan application forward.",
    eyebrow: "LOAN OFFERS",
    description: "Pay a processing fee or make a scheduled repayment using Razorpay Checkout.",
    recipientLabel: "Loan reference",
    recipientPlaceholder: "Enter your loan reference",
    amountLabel: "Payment amount",
    buttonLabel: "Pay loan amount",
    note: "A payment receipt will be shown after Razorpay confirms the transaction.",
  },
  insurance: {
    title: "Protect what matters.",
    eyebrow: "INSURANCE",
    description: "Pay a premium or renew your cover with a secure, trackable payment.",
    recipientLabel: "Policy number",
    recipientPlaceholder: "Enter policy number",
    amountLabel: "Premium amount",
    buttonLabel: "Pay premium",
    note: "Confirm the policy details and coverage amount before continuing.",
  },
  "tax-tools": {
    title: "Plan your tax payment.",
    eyebrow: "TAX TOOLS",
    description: "Make an advance tax payment or settle a tax planning amount through Razorpay.",
    recipientLabel: "PAN or tax reference",
    recipientPlaceholder: "Enter PAN or reference",
    amountLabel: "Tax payment amount",
    buttonLabel: "Pay tax with Razorpay",
    note: "Use the receipt and payment ID for your records after a successful payment.",
  },
};

export default function PaymentActionClient({ action }: { action: string }) {
  const config = actionConfigs[action] ?? actionConfigs["send-money"];
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const options = actionOptions[action] ?? [];
  const requiresTerms = action === "insurance";

  function chooseOption(option: ActionOption) {
    setSelectedOption(option.id);
    setRecipient(option.recipient);
    if (option.amount) setAmount(option.amount);
    setStatus("idle");
    setMessage("");
  }

  async function startPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount);

    if (!recipient.trim() || !numericAmount || numericAmount < 1) {
      setStatus("error");
      setMessage("Enter a valid recipient and an amount of at least ₹1.");
      return;
    }

    if (options.length && !selectedOption) {
      setStatus("error");
      setMessage("Choose an option above before continuing.");
      return;
    }

    if (requiresTerms && !termsAccepted) {
      setStatus("error");
      setMessage("Please accept the policy terms and conditions before continuing.");
      return;
    }

    if (!keyId) {
      setStatus("error");
      setMessage("Razorpay is not configured yet. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to your local environment and restart the dev server.");
      return;
    }

    if (!window.Razorpay) {
      setStatus("error");
      setMessage("Razorpay Checkout is still loading. Try again in a moment.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const orderResponse = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount, action: config.eyebrow, recipient: recipient.trim() }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || "Unable to create Razorpay order.");

      const checkout = new window.Razorpay({
        key: keyId,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: "VaultFlow",
        description: config.title,
        prefill: { name: "VaultFlow customer", email: "customer@example.com", contact: "9999999999" },
        notes: { action: config.eyebrow, recipient: recipient.trim() },
        theme: { color: "#ff5500" },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verification = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(verification.error || "Payment verification failed.");
            setStatus("success");
            setMessage(`Payment confirmed. Razorpay payment ID: ${response.razorpay_payment_id}`);
          } catch (error) {
            setStatus("error");
            setMessage(error instanceof Error ? error.message : "Payment verification failed.");
          }
        },
        modal: { ondismiss: () => setStatus("idle") },
      });
      checkout.open();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to start Razorpay checkout.");
    }
  }

  return (
    <main className="min-h-screen bg-[#fdfbf7] text-[#0f172a]">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <nav className="border-b border-[#e9e8e4] bg-white px-6 py-4 sm:px-10">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-600 transition hover:text-[#ff5500]"><ArrowLeft size={16} /> Back to dashboard</Link>
          <div className="flex items-center gap-2 text-xs font-bold tracking-[0.16em]"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff5500] text-white">Y</span> YIELDPULSE</div>
        </div>
      </nav>

      <div className="mx-auto grid max-w-[1180px] gap-8 px-6 py-10 lg:grid-cols-[1fr_.8fr] lg:px-10 lg:py-16">
        <section>
          <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#ff5500]"><ArrowLeft size={14} /> Quick action</Link>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff5500]">{config.eyebrow}</p>
          <h1 className="mt-4 max-w-xl font-display text-4xl leading-tight sm:text-6xl">{config.title}</h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500">{config.description}</p>
          <div className="mt-9 grid max-w-lg gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#e9e8e4] bg-white p-4"><ShieldCheck size={18} className="text-[#10b981]" /><p className="mt-3 text-xs font-bold">Secure checkout</p></div>
            <div className="rounded-xl border border-[#e9e8e4] bg-white p-4"><CreditCard size={18} className="text-[#ff5500]" /><p className="mt-3 text-xs font-bold">UPI & cards</p></div>
            <div className="rounded-xl border border-[#e9e8e4] bg-white p-4"><CircleHelp size={18} className="text-slate-500" /><p className="mt-3 text-xs font-bold">Instant receipt</p></div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#e9e8e4] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ff5500]">Payment details</p><h2 className="mt-2 font-display text-2xl">Ready when you are.</h2></div><Sparkles size={22} className="text-[#ff5500]" /></div>
          <form onSubmit={startPayment} className="mt-8 space-y-5">
            {options.length > 0 && <div>
              <div className="mb-3 flex items-end justify-between gap-4"><span className="text-xs font-bold">{action === "send-money" ? "Select your bank" : action === "pay-bills" ? "Choose a bill to pay" : action === "loans" ? "Compare loan options" : action === "insurance" ? "Available policies" : action === "tax-tools" ? "Choose a tax tool" : "Choose an investment"}</span><span className="text-[10px] text-slate-400">{options.length} available</span></div>
              <div className="grid gap-2">
                {options.map((option) => <button key={option.id} type="button" onClick={() => chooseOption(option)} className={`w-full rounded-xl border p-3 text-left transition ${selectedOption === option.id ? "border-[#ff5500] bg-[#fff5ef]" : "border-[#e5e2db] bg-[#fdfbf7] hover:border-[#ff5500]/50"}`}>
                  <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold">{option.title}</p><p className="mt-1 text-[11px] text-slate-500">{option.detail}</p></div><span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selectedOption === option.id ? "border-[#ff5500] bg-[#ff5500]" : "border-slate-300"}`}>{selectedOption === option.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}</span></div>
                  <p className="mt-2 text-[10px] font-semibold text-slate-400">{option.meta}</p>
                </button>)}
              </div>
            </div>}
            <label className="block"><span className="text-xs font-bold">{config.recipientLabel}</span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={config.recipientPlaceholder} className="mt-2 w-full rounded-xl border border-[#e5e2db] bg-[#fdfbf7] px-4 py-3 text-sm outline-none transition focus:border-[#ff5500]" /></label>
            <label className="block"><span className="text-xs font-bold">{config.amountLabel}</span><div className="relative mt-2"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span><input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" className="w-full rounded-xl border border-[#e5e2db] bg-[#fdfbf7] py-3 pl-8 pr-4 text-sm outline-none transition focus:border-[#ff5500]" /></div></label>
            {requiresTerms && <label className="flex items-start gap-3 rounded-xl border border-[#e5e2db] bg-[#fdfbf7] p-3 text-[11px] leading-5 text-slate-600"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 accent-[#ff5500]" /><span>I have reviewed the selected policy, coverage, exclusions, and <button type="button" className="font-bold text-[#ff5500] underline">terms and conditions</button>.</span></label>}
            <button type="submit" disabled={status === "loading"} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5500] px-5 py-4 text-xs font-bold text-white transition hover:bg-[#e64900] disabled:cursor-wait disabled:opacity-60">{status === "loading" ? "Opening secure checkout..." : config.buttonLabel}<ArrowUpRight size={16} /></button>
          </form>
          {status === "success" && <div className="mt-5 flex gap-3 rounded-xl bg-[#eafaf4] p-4 text-xs leading-5 text-[#047857]"><CheckCircle2 size={18} className="shrink-0" />{message}</div>}
          {status === "error" && <p role="alert" className="mt-5 rounded-xl bg-[#fff0e9] p-4 text-xs leading-5 text-[#b93800]">{message}</p>}
          <p className="mt-5 text-[11px] leading-5 text-slate-400">{config.note}</p>
        </section>
      </div>
    </main>
  );
}
