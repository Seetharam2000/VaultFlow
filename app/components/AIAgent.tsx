"use client";

import { FormEvent, useState } from "react";
import { Bot, ChevronDown, LoaderCircle, Send, Sparkles, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const quickPrompts = ["Explain my liquidity", "How do term deposits work?", "What can I change in Settings?"];

export default function AIAgent() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi, I’m your VaultFlow Agent. Ask me about your cash, deposits, payments, or any part of the app." },
  ]);

  async function sendMessage(event?: FormEvent, prompt = input) {
    event?.preventDefault();
    const content = prompt.trim();
    if (!content || loading) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The agent could not respond.");
      setMessages([...nextMessages, { role: "assistant", content: result.message }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The agent could not respond.");
    } finally {
      setLoading(false);
    }
  }

  return <><button aria-label="Open YieldPulse AI Agent" onClick={() => setOpen(!open)} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#ff5500] px-4 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-[#e94b00]"><Sparkles size={16} /> AI Agent</button>{open && <section className="fixed bottom-20 right-5 z-40 flex h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#e9e8e4] bg-white shadow-2xl"><header className="flex items-center justify-between bg-[#0a192f] p-5 text-white"><div><p className="flex items-center gap-2 text-sm font-bold"><Bot size={18} className="text-[#ffb08c]" /> YieldPulse Agent</p><p className="mt-1 text-[10px] text-slate-400">Ask anything about your account experience</p></div><button aria-label="Close AI Agent" onClick={() => setOpen(false)} className="text-slate-300 hover:text-white"><X size={18} /></button></header><div className="flex-1 space-y-3 overflow-y-auto bg-[#f8f7f3] p-4">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-5 ${message.role === "user" ? "ml-auto rounded-br-sm bg-[#ff5500] text-white" : "rounded-bl-sm bg-white text-slate-700 shadow-sm"}`}>{message.content}</div>)}{loading && <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-xs text-slate-500 shadow-sm"><LoaderCircle size={14} className="animate-spin" /> Thinking...</div>}{error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-[11px] leading-4 text-red-700">{error}</p>}</div><div className="border-t border-[#e9e8e4] bg-white p-3"><div className="mb-3 flex gap-2 overflow-x-auto">{quickPrompts.map((prompt) => <button key={prompt} disabled={loading} onClick={() => sendMessage(undefined, prompt)} className="whitespace-nowrap rounded-full border border-[#e9e8e4] px-3 py-2 text-[10px] font-bold text-slate-600 transition hover:border-[#ff5500] hover:text-[#ff5500]">{prompt}</button>)}</div><form onSubmit={sendMessage} className="flex items-center gap-2"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask your agent..." aria-label="Message the AI agent" className="min-w-0 flex-1 rounded-xl border border-[#e9e8e4] px-3 py-3 text-xs outline-none focus:border-[#ff5500]" /><button aria-label="Send message" disabled={!input.trim() || loading} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff5500] text-white disabled:cursor-not-allowed disabled:bg-slate-300"><Send size={15} /></button></form><div className="mt-2 flex items-center justify-between text-[9px] text-slate-400"><span>AI can make mistakes. Review financial terms.</span><ChevronDown size={12} /></div></div></section>}</>;
}
