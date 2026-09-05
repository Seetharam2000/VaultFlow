"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDeposits } from "@/context/DepositContext";

const publicPaths = ["/", "/login", "/account-setup", "/about", "/contact"];

export default function AccountLinkGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { account, hydrated } = useDeposits();

  useEffect(() => {
    if (hydrated && !publicPaths.includes(pathname) && !account.accountLinked) router.replace("/account-setup");
  }, [account.accountLinked, hydrated, pathname, router]);

  return null;
}