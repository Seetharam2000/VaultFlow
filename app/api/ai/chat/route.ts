import { NextResponse } from "next/server";

export const runtime = "nodejs";

const systemPrompt = `You are YieldPulse Agent, a clear and helpful financial productivity assistant inside a demo banking app. Help with liquidity analysis, term deposits, projected interest, settings, payments, and general questions. Explain assumptions and calculations plainly. Never claim to execute a transaction, access private accounts, or provide regulated financial advice. Remind users that displayed rates and projections are illustrative and that they should review the terms before committing money. Keep responses concise unless the user asks for detail.`;

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
  if (!apiKey) {
    return NextResponse.json({ error: "The AI agent is not configured yet. Add GROQ_API_KEY to .env.local and restart the dev server." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const messages = Array.isArray(body.messages)
      ? body.messages.filter((message: unknown): message is { role: "user" | "assistant"; content: string } => {
          if (!message || typeof message !== "object") return false;
          const candidate = message as { role?: unknown; content?: unknown };
          return (candidate.role === "user" || candidate.role === "assistant") && typeof candidate.content === "string" && candidate.content.trim().length > 0;
        }).slice(-12)
      : [];

    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ error: "Please enter a question first." }, { status: 400 });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, temperature: 0.4, max_tokens: 500, messages: [{ role: "system", content: systemPrompt }, ...messages] }),
    });

    const result = await groqResponse.json();
    if (!groqResponse.ok) return NextResponse.json({ error: result.error?.message || "The AI agent could not respond right now." }, { status: groqResponse.status });

    const content = result.choices?.[0]?.message?.content;
    if (typeof content !== "string") return NextResponse.json({ error: "The AI agent returned an empty response." }, { status: 502 });
    return NextResponse.json({ message: content });
  } catch {
    return NextResponse.json({ error: "Unable to reach the AI agent. Please try again." }, { status: 500 });
  }
}
