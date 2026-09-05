"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type TermDeposit = { id: string; amount: number; tenure: number; rate: number; createdAt: string; flexiBreak: boolean; status: "Active" | "Matured"; usedAmount: number; feeRate: number; projectedInterest: number; incrementalInterest: number; platformFee: number; netInterest: number };
export type AccountSettings = { displayName: string; email: string; remember: boolean; bankName: string; accountNumber: string; ifscCode: string; accountLinked: boolean; operatingBaseline: number; monthlyExpenses: number; thresholdMultiplier: number; emergencyBufferEnabled: boolean; emailAlerts: boolean; agentRecommendations: boolean; voiceBanking: boolean; twoFactor: boolean; theme: "light" | "dark" };
type DepositContextValue = { savingsBalance: number; deposits: TermDeposit[]; historicalInterest: number; account: AccountSettings; lastEmergencyAction: { billAmount: number; brokenAmount: number; createdAt: string } | null; hydrated: boolean; createDeposit: (amount: number, tenure: number, rate: number, flexiBreak: boolean, feeRate?: number) => void; protectEmergencyBuffer: (billAmount: number) => { brokenAmount: number; protectedBalance: number }; updateAccount: (changes: Partial<AccountSettings>) => void };

export function calculateDepositEarnings(amount: number, tenure: number, rate: number, feeRate: number) {
  const projectedInterest = amount * (rate / 100) * (tenure / 12);
  const savingsInterest = amount * 0.03 * (tenure / 12);
  const incrementalInterest = Math.max(0, projectedInterest - savingsInterest);
  const platformFee = incrementalInterest * (feeRate / 100);
  return { projectedInterest, savingsInterest, incrementalInterest, platformFee, netInterest: projectedInterest - platformFee };
}
const DepositContext = createContext<DepositContextValue | null>(null);
function savedData(): { savingsBalance: number; deposits: TermDeposit[]; historicalInterest: number } {
  if (typeof window === "undefined") return { savingsBalance: 2500000, deposits: [] as TermDeposit[], historicalInterest: 0 };
  const saved = window.localStorage.getItem("yieldpulse-deposits");
  return saved ? JSON.parse(saved) : { savingsBalance: 2500000, deposits: [] as TermDeposit[], historicalInterest: 0 };
}

function savedAccount(): AccountSettings {
  if (typeof window === "undefined") return { displayName: "there", email: "", remember: true, bankName: "", accountNumber: "", ifscCode: "", accountLinked: false, operatingBaseline: 1500000, monthlyExpenses: 500000, thresholdMultiplier: 3, emergencyBufferEnabled: true, emailAlerts: true, agentRecommendations: true, voiceBanking: true, twoFactor: true, theme: "light" };
  const saved = window.localStorage.getItem("yieldpulse-user");
  const account = saved ? JSON.parse(saved) : {};
  return { displayName: account.displayName || "there", email: account.email || "", remember: account.remember ?? true, bankName: account.bankName || "", accountNumber: account.accountNumber || "", ifscCode: account.ifscCode || "", accountLinked: account.accountLinked ?? false, operatingBaseline: account.operatingBaseline ?? 1500000, monthlyExpenses: account.monthlyExpenses ?? 500000, thresholdMultiplier: account.thresholdMultiplier ?? 3, emergencyBufferEnabled: account.emergencyBufferEnabled ?? true, emailAlerts: account.emailAlerts ?? true, agentRecommendations: account.agentRecommendations ?? true, voiceBanking: account.voiceBanking ?? true, twoFactor: account.twoFactor ?? true, theme: account.theme === "dark" ? "dark" : "light" };
}

export function DepositProvider({ children }: { children: ReactNode }) {
  const [savingsBalance, setSavingsBalance] = useState(2500000);
  const [deposits, setDeposits] = useState<TermDeposit[]>([]);
  const [historicalInterest, setHistoricalInterest] = useState(0);
  const [account, setAccount] = useState<AccountSettings>({ displayName: "there", email: "", remember: true, bankName: "", accountNumber: "", ifscCode: "", accountLinked: false, operatingBaseline: 1500000, monthlyExpenses: 500000, thresholdMultiplier: 3, emergencyBufferEnabled: true, emailAlerts: true, agentRecommendations: true, voiceBanking: true, twoFactor: true, theme: "light" });
  const [lastEmergencyAction, setLastEmergencyAction] = useState<{ billAmount: number; brokenAmount: number; createdAt: string } | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const data = savedData();
      setSavingsBalance(data.savingsBalance);
      setDeposits(data.deposits);
      setHistoricalInterest(data.historicalInterest);
      setAccount(savedAccount());
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem("yieldpulse-deposits", JSON.stringify({ savingsBalance, deposits, historicalInterest }));
    window.localStorage.setItem("yieldpulse-user", JSON.stringify(account));
  }, [savingsBalance, deposits, historicalInterest, account, hydrated]);

  function createDeposit(amount: number, tenure: number, rate: number, flexiBreak: boolean, feeRate = 5) {
    const earnings = calculateDepositEarnings(amount, tenure, rate, feeRate);
    setSavingsBalance((balance) => balance - amount);
    setDeposits((items) => [{ id: `YP-${Date.now()}`, amount, tenure, rate, createdAt: new Date().toISOString(), flexiBreak, status: "Active", usedAmount: 0, feeRate, ...earnings }, ...items]);
    setHistoricalInterest((value) => value + earnings.netInterest);
  }

  function updateAccount(changes: Partial<AccountSettings>) { setAccount((current) => ({ ...current, ...changes })); }

  function protectEmergencyBuffer(billAmount: number) {
    const threshold = account.monthlyExpenses * account.thresholdMultiplier;
    const availableAfterBill = savingsBalance - billAmount;
    const brokenAmount = account.emergencyBufferEnabled ? Math.max(0, threshold - availableAfterBill) : 0;
    if (billAmount <= 0) return { brokenAmount: 0, protectedBalance: savingsBalance };
    setSavingsBalance((balance) => balance - billAmount + Math.min(brokenAmount, balance));
    if (brokenAmount > 0) setDeposits((items) => { let remaining = brokenAmount; return items.map((deposit) => { if (remaining <= 0 || deposit.amount <= 0) return deposit; const amount = Math.min(remaining, deposit.amount); remaining -= amount; return { ...deposit, amount: deposit.amount - amount, usedAmount: deposit.usedAmount + amount }; }); });
    const action = { billAmount, brokenAmount, createdAt: new Date().toISOString() };
    setLastEmergencyAction(action);
    return { brokenAmount, protectedBalance: availableAfterBill + Math.min(brokenAmount, savingsBalance) };
  }

  const value = { savingsBalance, deposits, historicalInterest, account, lastEmergencyAction, hydrated, createDeposit, protectEmergencyBuffer, updateAccount };
  return <DepositContext.Provider value={value}>{children}</DepositContext.Provider>;
}

export function useDeposits() {
  const value = useContext(DepositContext);
  if (!value) throw new Error("useDeposits must be used inside DepositProvider");
  return value;
}
