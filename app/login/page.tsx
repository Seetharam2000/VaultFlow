"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider, startAnalytics } from "@/lib/firebase";
import { useDeposits } from "@/context/DepositContext";

const metrics = [
  { label: "New income", value: "+₹42,500", note: "this month", tone: "orange" },
  { label: "Total balance", value: "₹5,24,180", note: "+13.6% this year", tone: "mint" },
  { label: "Guard checks", value: "2,847", note: "protected today", tone: "navy" },
];

export default function LoginPage() {
  const router = useRouter();
  const { updateAccount } = useDeposits();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem("yieldpulse-user");
      if (saved) {
        const user = JSON.parse(saved);
        setDisplayName(user.displayName ?? "");
        setEmail(user.email ?? "");
        setRemember(user.remember ?? true);
      }
      void startAnalytics();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createMode) {
      void handleCreateAccount();
      return;
    }
    updateAccount({ displayName, email, remember });
    window.localStorage.removeItem("vaultflow-welcome-seen");
    window.localStorage.setItem("vaultflow-show-welcome", "true");
    router.push("/account-setup");
  }

  async function handleCreateAccount() {
    setAuthError("");
    setGoogleLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      updateAccount({ displayName, email: result.user.email || email, remember: true });
      window.localStorage.removeItem("vaultflow-welcome-seen");
      window.localStorage.setItem("vaultflow-show-welcome", "true");
      router.push("/account-setup");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Account creation was not completed.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setAuthError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      updateAccount({ displayName: result.user.displayName || "there", email: result.user.email || "", remember: true });
      window.localStorage.removeItem("vaultflow-welcome-seen");
      window.localStorage.setItem("vaultflow-show-welcome", "true");
      router.push("/account-setup");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Google sign-in was not completed.");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#0a192f] px-12 py-10 text-white lg:flex lg:flex-col xl:px-20">
        <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute bottom-[-190px] left-[-100px] h-[460px] w-[460px] rounded-full border-[70px] border-[#ff5500]/15" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff5500] font-bold">N</div>
          <span className="text-[15px] font-bold tracking-[0.18em]">VAULTFLOW</span>
        </div>
        <div className="relative z-10 mt-auto max-w-xl pb-12">
          <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb08c]"><Sparkles size={14} /> Automated deposit growth</p>
          <h1 className="font-display text-6xl leading-[1.02] tracking-[-0.03em] xl:text-7xl">Make idle cash<br />work <em className="text-[#ff6a2f]">harder.</em></h1>
          <p className="mt-7 max-w-md text-[15px] leading-7 text-slate-300">VaultFlow detects excess cash, models your liquidity needs, and helps move the rest into higher-yield term deposits.</p>
          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            {metrics.map((metric, index) => (
              <motion.div key={metric.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.12 }} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                <div className={`mb-5 h-1 w-7 rounded-full ${metric.tone === "orange" ? "bg-[#ff5500]" : metric.tone === "mint" ? "bg-[#10b981]" : "bg-[#8ca2bd]"}`} />
                <p className="text-[11px] text-slate-400">{metric.label}</p>
                <p className="mt-1 text-lg font-semibold tracking-tight">{metric.value}</p>
                <p className="mt-1 text-[10px] text-slate-400">{metric.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400"><span>Built for your next chapter.</span><span>© 2026 VaultFlow</span></div>
      </section>

      <section className="flex min-h-screen flex-col bg-[#fdfbf7] px-6 py-8 sm:px-12 lg:px-20 xl:px-28">
        <div className="flex items-center justify-between lg:justify-end"><div className="flex items-center gap-2 lg:hidden"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff5500] text-sm font-bold text-white">Y</div><span className="text-xs font-bold tracking-[0.18em]">VAULTFLOW</span></div><p className="text-xs text-slate-500">{createMode ? "Already registered?" : "New here?"} <button type="button" onClick={() => { setCreateMode(!createMode); setAuthError(""); }} className="font-bold text-[#ff5500] hover:underline">{createMode ? "Sign in" : "Create account"} <ArrowUpRight className="inline" size={13} /></button></p></div>
        <div className="mx-auto flex w-full max-w-[410px] flex-1 flex-col justify-center py-12">
          <div className="mb-10"><p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#ff5500]">{createMode ? "Get started" : "Welcome back"}</p><h2 className="font-display text-5xl tracking-[-0.04em] text-[#0f172a]">{createMode ? <>Create your<br /><span className="text-[#ff5500]">VaultFlow account.</span></> : <>Sign in to<br /><span className="text-[#ff5500]">your future.</span></>}</h2><p className="mt-5 text-sm leading-6 text-slate-500">{createMode ? "Set up your account and start understanding your money." : "A smarter view of your money is waiting."}</p></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-xs font-bold text-slate-700">Display name<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="How should we greet you?" className="mt-2 h-12 w-full rounded-xl border border-[#deddd8] bg-white px-4 text-sm outline-none transition focus:border-[#ff5500] focus:ring-4 focus:ring-[#ff5500]/10" /></label>
            <label className="block text-xs font-bold text-slate-700">Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 h-12 w-full rounded-xl border border-[#deddd8] bg-white px-4 text-sm outline-none transition focus:border-[#ff5500] focus:ring-4 focus:ring-[#ff5500]/10" /></label>
            <label className="block text-xs font-bold text-slate-700">Password<div className="relative mt-2"><input required minLength={4} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-[#deddd8] bg-white px-4 pr-12 text-sm outline-none transition focus:border-[#ff5500] focus:ring-4 focus:ring-[#ff5500]/10" /><button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            <div className="flex items-center justify-between pt-1"><label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 accent-[#ff5500]" /> Remember me</label><button type="button" className="text-xs font-bold text-[#ff5500]">Forgot password?</button></div>
            {authError && <p className="rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">{authError}</p>}<button type="submit" disabled={googleLoading} className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#ff5500] text-sm font-bold text-white shadow-lg shadow-[#ff5500]/20 transition hover:-translate-y-0.5 hover:bg-[#e94b00] disabled:cursor-wait disabled:opacity-60">{googleLoading ? "Creating account..." : createMode ? "Create account" : "Sign in securely"} <ArrowUpRight size={17} /></button>
          </form>
          <div className="my-7 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400"><span className="h-px flex-1 bg-[#e4e2dd]" /> or continue with <span className="h-px flex-1 bg-[#e4e2dd]" /></div>
          {authError && <p className="mb-3 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-700">{authError}</p>}<div className="grid grid-cols-2 gap-3"><button type="button" disabled={googleLoading} onClick={handleGoogleSignIn} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#deddd8] bg-white text-xs font-bold text-slate-700 transition hover:border-slate-400 disabled:cursor-wait disabled:opacity-60"><span className="text-base font-bold text-[#4285f4]">G</span> {googleLoading ? "Connecting..." : "Google"}</button><button type="button" className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#deddd8] bg-white text-xs font-bold text-slate-700 transition hover:border-slate-400"><span className="text-base">●</span> Apple</button></div>
          <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-slate-400"><LockKeyhole size={13} /> Secure encryption <span className="text-[#10b981]">•</span> <ShieldCheck size={13} /> Agent protected</div>
        </div>
      </section>
    </main>
  );
}