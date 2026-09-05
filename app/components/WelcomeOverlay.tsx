"use client";

import Link from "next/link";
import { ArrowRight, Bot, ChartNoAxesCombined, ShieldCheck, WalletCards, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function WelcomeOverlay() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const shouldShowAfterLogin = window.localStorage.getItem("vaultflow-show-welcome") === "true";
      const firstDashboardVisit = pathname === "/dashboard" && window.localStorage.getItem("vaultflow-welcome-seen") !== "true";
      if (shouldShowAfterLogin || firstDashboardVisit) {
        setOpen(true);
        window.localStorage.removeItem("vaultflow-show-welcome");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!open) return null;

  function dismiss() {
    setOpen(false);
    window.localStorage.setItem("vaultflow-welcome-seen", "true");
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06111f]/75 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="welcome-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"><div className="relative overflow-hidden bg-[#0a192f] px-6 py-8 text-white sm:px-10 sm:py-10"><button aria-label="Close VaultFlow welcome screen" onClick={dismiss} className="absolute right-5 top-5 text-slate-300 transition hover:text-white"><X size={20} /></button><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ffb08c]">Welcome to VaultFlow</p><h2 id="welcome-title" className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">A clearer way to make your money work harder.</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">VaultFlow is an intelligent money workspace that helps you understand idle cash, protect your everyday operating needs, and thoughtfully improve your yield. You stay in control at every step.</p></div><div className="p-6 sm:p-10"><div className="grid gap-4 sm:grid-cols-3"><Feature icon={<ChartNoAxesCombined />} title="Map your liquidity" text="See your safe operating balance, available surplus, and cash-flow needs in one view." /><Feature icon={<WalletCards />} title="Build a strategy" text="Compare deposits, liquid funds, and government-backed options before committing." /><Feature icon={<Bot />} title="Get guided help" text="Ask the VaultFlow Agent about your account experience, calculations, and next steps." /></div><div className="mt-7 rounded-2xl border border-[#ccefe1] bg-[#f0fbf6] p-5"><p className="flex items-center gap-2 text-xs font-bold text-[#087f5b]"><ShieldCheck size={16} /> Designed around your control</p><p className="mt-2 text-xs leading-5 text-slate-600">VaultFlow does not move money automatically. You review the amount, rate, terms, risk, and projected outcome before confirming a deposit or payment.</p></div><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link href="/account-setup" onClick={dismiss} className="flex items-center justify-center gap-2 rounded-xl bg-[#ff5500] px-5 py-4 text-xs font-bold text-white">Connect your account <ArrowRight size={16} /></Link><button onClick={dismiss} className="rounded-xl border border-[#e9e8e4] px-5 py-4 text-xs font-bold text-slate-700">I’ll do this later</button></div></div></section></div>;
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="rounded-2xl border border-[#e9e8e4] p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff0e9] text-[#ff5500]">{icon}</div><h3 className="mt-4 font-display text-xl">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-500">{text}</p></div>; }
