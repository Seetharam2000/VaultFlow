"use client";

import { useEffect } from "react";
import { useDeposits } from "@/context/DepositContext";

export default function ThemeSync() {
  const { account } = useDeposits();
  useEffect(() => {
    document.documentElement.dataset.theme = account.theme;
  }, [account.theme]);
  return null;
}
