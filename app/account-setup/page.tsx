"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Building2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeposits } from "@/context/DepositContext";

const banks = {
  "Public sector banks": ["Bank of Baroda", "Bank of India", "Bank of Maharashtra", "Canara Bank", "Central Bank of India", "Indian Bank", "Indian Overseas Bank", "Punjab & Sind Bank", "Punjab National Bank", "State Bank of India", "UCO Bank", "Union Bank of India"],
  "Private sector banks": ["Axis Bank", "Bandhan Bank", "CSB Bank", "City Union Bank", "DCB Bank", "Dhanlaxmi Bank", "Federal Bank", "HDFC Bank", "ICICI Bank", "IDBI Bank", "IDFC FIRST Bank", "IndusInd Bank", "Jammu & Kashmir Bank", "Karnataka Bank", "Karur Vysya Bank", "Kotak Mahindra Bank", "Nainital Bank", "RBL Bank", "South Indian Bank", "Tamilnad Mercantile Bank", "YES Bank"],
  "Small finance banks": ["AU Small Finance Bank", "Capital Small Finance Bank", "ESAF Small Finance Bank", "Equitas Small Finance Bank", "Jana Small Finance Bank", "North East Small Finance Bank", "Shivalik Small Finance Bank", "Suryoday Small Finance Bank", "Ujjivan Small Finance Bank", "Unity Small Finance Bank", "Utkarsh Small Finance Bank"],
  "Payments banks": ["Airtel Payments Bank", "India Post Payments Bank", "Jio Payments Bank", "NSDL Payments Bank", "Paytm Payments Bank"],
  "Foreign banks": ["American Express Banking Corporation", "Bank of America", "Bank of China", "Barclays Bank", "Citibank", "DBS Bank India", "Deutsche Bank", "HSBC India", "J.P. Morgan Chase Bank", "Standard Chartered Bank"],
};

export default function AccountSetupPage() {
  const router = useRouter();
  const { account, updateAccount } = useDeposits();
  const [bankName, setBankName] = useState(account.bankName);
  const [accountNumber, setAccountNumber] = useState(account.accountNumber);
  const [ifscCode, setIfscCode] = useState(account.ifscCode);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateAccount({ bankName, accountNumber, ifscCode: ifscCode.toUpperCase(), accountLinked: true });
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#fdfbf7] px-6 py-8 text-[#0f172a] sm:px-10 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff5500] font-bold text-white">V</span><span className="text-[13px] font-bold tracking-[0.18em]">VAULTFLOW</span></div>
        <div className="mx-auto max-w-xl py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff5500]">One last step</p>
          <h1 className="mt-4 font-display text-5xl leading-tight">Connect the account that powers your money picture.</h1>
          <p className="mt-5 text-sm leading-6 text-slate-500">Add the account details you want VaultFlow to use for balance, liquidity, and yield planning. Your details stay tied to your profile.</p>
          <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-2xl border border-[#e9e8e4] bg-white p-6 shadow-sm sm:p-8">
            <label className="block text-xs font-bold text-slate-700">Bank name
              <select required value={bankName} onChange={(event) => setBankName(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#deddd8] bg-white px-4 text-sm outline-none focus:border-[#ff5500] focus:ring-4 focus:ring-[#ff5500]/10">
                <option value="" disabled>Select your bank</option>
                {Object.entries(banks).map(([group, options]) => <optgroup key={group} label={group}>{options.map((bank) => <option key={bank} value={bank}>{bank}</option>)}</optgroup>)}
                <option value="Other">Other</option>
              </select>
            </label>
            <label className="block text-xs font-bold text-slate-700">Account number<input required inputMode="numeric" minLength={6} value={accountNumber} onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ""))} placeholder="Enter your account number" className="mt-2 h-12 w-full rounded-xl border border-[#deddd8] px-4 text-sm outline-none focus:border-[#ff5500] focus:ring-4 focus:ring-[#ff5500]/10" /></label>
            <label className="block text-xs font-bold text-slate-700">IFSC code<input required value={ifscCode} onChange={(event) => setIfscCode(event.target.value.toUpperCase())} placeholder="e.g. HDFC0001234" className="mt-2 h-12 w-full rounded-xl border border-[#deddd8] px-4 text-sm uppercase outline-none focus:border-[#ff5500] focus:ring-4 focus:ring-[#ff5500]/10" /></label>
            <button type="submit" className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#ff5500] text-sm font-bold text-white shadow-lg shadow-[#ff5500]/20 transition hover:-translate-y-0.5 hover:bg-[#e94b00]">Continue to my dashboard <ArrowRight size={17} /></button>
            <p className="flex items-center justify-center gap-2 text-center text-[11px] text-slate-400"><LockKeyhole size={13} /> Your banking details are encrypted and used only for your VaultFlow workspace.</p>
          </form>
          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400"><Building2 size={14} /> Account holder: {account.displayName}</p>
        </div>
      </div>
    </main>
  );
}
