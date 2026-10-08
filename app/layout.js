import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/providers/AppProviders";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "ForiPay (فوری پے) — Bina Intezar Instant Crypto Payment Gateway",
  description:
    "3-second mempool detection, zero waiting anxiety, and direct non-custodial crypto settlement for merchants and customers.",
  keywords: "foripay, crypto payments, instant bitcoin, mempool, fast crypto checkout, non-custodial",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

