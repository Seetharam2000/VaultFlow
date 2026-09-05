import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { DepositProvider } from "@/context/DepositContext";
import AIAgent from "@/app/components/AIAgent";
import ThemeSync from "@/app/components/ThemeSync";
import WelcomeOverlay from "@/app/components/WelcomeOverlay";
import AccountLinkGuard from "@/app/components/AccountLinkGuard";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VaultFlow | Automated deposit growth",
  description: "An intelligent deposit growth agent for your idle cash.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><DepositProvider><ThemeSync /><AccountLinkGuard />{children}<AIAgent /><WelcomeOverlay /></DepositProvider></body>
    </html>
  );
}
