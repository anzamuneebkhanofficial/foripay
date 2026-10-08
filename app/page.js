"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const [demoStep, setDemoStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [telemetry, setTelemetry] = useState({
    currentBlockHeight: "#884,912",
    ethBlockHeight: "#19,043,014",
    networkFeePriority: "22.4 sat/vB (High)",
    totalVolume24h: "$48,920.50 USD",
    activeSessions: 12,
    settlementRate: "99.4%",
  });

  useEffect(() => {
    fetch("/api/telemetry")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setTelemetry(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSimulatePayment = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setDemoStep(1); // Payment Detected

    setTimeout(() => {
      setDemoStep(2); // Confirming 1/3
    }, 1800);

    setTimeout(() => {
      setDemoStep(3); // Confirmed 3/3
      setIsSimulating(false);
    }, 3800);
  };

  const handleResetDemo = () => {
    setDemoStep(0);
    setIsSimulating(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-canvas)" }}>
      <Navbar />

      <main style={{ flex: 1, paddingTop: "64px" }}>
        {/* Hero Section */}
        <section
          style={{
            position: "relative",
            padding: "88px 0 64px",
            overflow: "hidden",
            borderBottom: "1px solid var(--border-glass)",
          }}
        >
          {/* Ambient Cosmic Radial Glow */}
          <div
            style={{
              position: "absolute",
              top: "-10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "700px",
              height: "450px",
              background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(34, 211, 238, 0.1) 45%, transparent 70%)",
              filter: "blur(70px)",
              pointerEvents: "none",
            }}
          />

          <div className="container-constrained" style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            {/* Pill Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
              <div className="badge-pill badge-cyan font-mono" style={{ fontSize: "12px", padding: "6px 16px" }}>
                <span className="status-pip pip-cyan" />
                NOWPAYMENTS V2.4 GATEWAY • ZERO CUSTODIAL RISK
              </div>
            </div>

            {/* Headline */}
            <h1
              className="text-headline-xl"
              style={{
                maxWidth: "920px",
                margin: "0 auto 20px",
                color: "#F8FAFC",
                fontSize: "48px",
                lineHeight: "1.18",
                letterSpacing: "-0.03em",
              }}
            >
              ForiPay (فوری پے) — Bina Intezar Crypto Payment
            </h1>

            {/* Sub-headline */}
            <p
              style={{
                maxWidth: "760px",
                margin: "0 auto 36px",
                fontSize: "18px",
                lineHeight: "1.6",
                color: "var(--text-muted)",
              }}
            >
              45-minute confirmation ke intezar ka dard khatam. ForiPay wallet se send hotay hi 3 second ke andar mempool se payment pakad leta hai, customer ko live tasalli deta hai, aur paisa seedha aapke wallet mein transfer karta hai.
            </p>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginBottom: "52px" }}>
              <Link href="/register" className="btn-primary" style={{ padding: "14px 32px", fontSize: "15px", fontWeight: "600" }}>
                Start Accepting Crypto Free →
              </Link>
              <Link href="/login" className="btn-secondary" style={{ padding: "14px 28px", fontSize: "15px" }}>
                Merchant Console Login
              </Link>
            </div>

            {/* Live Metrics Ribbon */}
            <div
              className="glass-card"
              style={{
                maxWidth: "1060px",
                margin: "0 auto",
                padding: "20px 24px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "20px",
                textAlign: "left",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" }}>
                  Mempool Detection Speed
                </div>
                <div className="font-mono" style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-accent-cyan)" }}>
                  &lt; 2.8 Seconds
                </div>
                <div style={{ fontSize: "11px", color: "var(--color-success-emerald)", marginTop: "2px" }}>
                  Unconfirmed broadcast listener
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" }}>
                  Custodial Risk
                </div>
                <div className="font-mono" style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-success-emerald)" }}>
                  0% (Non-Custodial)
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Direct to merchant cold vault
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" }}>
                  Email Notifications
                </div>
                <div className="font-mono" style={{ fontSize: "20px", fontWeight: 700, color: "#C0C1FF" }}>
                  Instant SMTP
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Gmail automated delivery
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" }}>
                  24h Settlement Rate
                </div>
                <div className="font-mono" style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-accent-cyan)" }}>
                  {telemetry.settlementRate}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  Volume: {telemetry.totalVolume24h}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Simulator: See How Fast Crypto Payments Feel */}
        <section id="simulator" style={{ padding: "64px 0", background: "rgba(14, 14, 20, 0.5)" }}>
          <div className="container-constrained">
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <div className="badge-pill badge-muted font-mono" style={{ fontSize: "11px", marginBottom: "8px" }}>
                INTERACTIVE DEMO
              </div>
              <h2 className="text-headline-lg">Experience Instant Mempool Feedback</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "600px", margin: "8px auto 0" }}>
                See how PayLock eliminates buyer anxiety by acknowledging payments before the block is even mined.
              </p>
            </div>

            <div
              className="glass-card-elevated"
              style={{
                maxWidth: "760px",
                margin: "0 auto",
                padding: "32px",
                border: "1px solid var(--border-glass)",
              }}
            >
              {/* Simulator State Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "20px",
                  borderBottom: "1px solid var(--border-glass)",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                    Demo Invoice #ORD-LIVE-771
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 700, color: "#F8FAFC" }}>
                    0.0452 BTC ($4,250.00 USD)
                  </div>
                </div>

                <div>
                  {demoStep === 0 && (
                    <span className="badge-pill badge-muted font-mono">
                      <span className="status-pip" style={{ background: "#94A3B8" }} />
                      Awaiting Payment
                    </span>
                  )}
                  {demoStep === 1 && (
                    <span className="badge-pill badge-cyan font-mono">
                      <span className="status-pip pip-cyan" />
                      Payment Detected in Mempool
                    </span>
                  )}
                  {demoStep === 2 && (
                    <span className="badge-pill badge-amber font-mono">
                      <span className="status-pip pip-amber" />
                      Confirming on Chain (1/3)
                    </span>
                  )}
                  {demoStep === 3 && (
                    <span className="badge-pill badge-emerald font-mono">
                      <span className="status-pip pip-emerald" />
                      Payment Complete & Settled
                    </span>
                  )}
                </div>
              </div>

              {/* Step Progress Tracker */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "28px" }}>
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: demoStep >= 1 ? "rgba(34, 211, 238, 0.1)" : "rgba(255, 255, 255, 0.03)",
                    border: demoStep >= 1 ? "1px solid rgba(34, 211, 238, 0.3)" : "1px solid var(--border-glass)",
                  }}
                >
                  <div style={{ fontSize: "11px", color: demoStep >= 1 ? "#22D3EE" : "var(--text-muted)", fontWeight: 600 }}>
                    1. Instant Detection
                  </div>
                  <div style={{ fontSize: "13px", color: "#F8FAFC", marginTop: "2px" }}>
                    {demoStep >= 1 ? "✓ Detected (1.8s)" : "Waiting for tx..."}
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: demoStep >= 2 ? "rgba(245, 158, 11, 0.1)" : "rgba(255, 255, 255, 0.03)",
                    border: demoStep >= 2 ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid var(--border-glass)",
                  }}
                >
                  <div style={{ fontSize: "11px", color: demoStep >= 2 ? "#F59E0B" : "var(--text-muted)", fontWeight: 600 }}>
                    2. Block Mining
                  </div>
                  <div style={{ fontSize: "13px", color: "#F8FAFC", marginTop: "2px" }}>
                    {demoStep >= 2 ? (demoStep === 3 ? "✓ 3/3 Finality" : "Confirming (1/3)") : "Pending"}
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    background: demoStep === 3 ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.03)",
                    border: demoStep === 3 ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-glass)",
                  }}
                >
                  <div style={{ fontSize: "11px", color: demoStep === 3 ? "#10B981" : "var(--text-muted)", fontWeight: 600 }}>
                    3. Settlement & Email
                  </div>
                  <div style={{ fontSize: "13px", color: "#F8FAFC", marginTop: "2px" }}>
                    {demoStep === 3 ? "✓ Receipt Dispatched" : "Pending"}
                  </div>
                </div>
              </div>

              {/* Simulator Action Controls */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  onClick={handleSimulatePayment}
                  disabled={isSimulating || demoStep === 3}
                  className="btn-primary"
                  style={{ padding: "12px 24px", fontSize: "14px" }}
                >
                  {isSimulating ? "⚡ Processing Simulation..." : demoStep === 3 ? "Payment Completed!" : "⚡ Simulate Customer Sending BTC"}
                </button>

                {demoStep > 0 && (
                  <button
                    onClick={handleResetDemo}
                    className="btn-secondary"
                    style={{ padding: "12px 18px", fontSize: "14px" }}
                  >
                    Reset Demo
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Why PayLock: 3 Core Pillars */}
        <section id="features" style={{ padding: "80px 0" }}>
          <div className="container-constrained">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div className="badge-pill badge-muted font-mono" style={{ fontSize: "11px", marginBottom: "8px" }}>
                MERCHANT ADVANTAGES
              </div>
              <h2 className="text-headline-lg">Built for Businesses That Can't Afford to Wait</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: "640px", margin: "10px auto 0" }}>
                Traditional crypto payment processors make customers wait up to an hour. PayLock combines instant mempool verification with non-custodial security.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
              {/* Feature 1 */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(34, 211, 238, 0.12)",
                    border: "1px solid rgba(34, 211, 238, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    marginBottom: "20px",
                  }}
                >
                  ⚡
                </div>
                <h3 className="text-headline-md" style={{ color: "#F8FAFC", marginBottom: "10px", fontSize: "18px" }}>
                  Zero-Latency Mempool Listening
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
                  Customers see an immediate visual confirmation the exact second they press "Send" in their wallet.
                  No 10-minute waiting on a spinning circle.
                </p>
                <div style={{ fontSize: "13px", color: "#22D3EE", fontWeight: 600 }}>
                  ✓ Instant Server-Sent Events (SSE)
                </div>
              </div>

              {/* Feature 2 */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    marginBottom: "20px",
                  }}
                >
                  🛡️
                </div>
                <h3 className="text-headline-md" style={{ color: "#F8FAFC", marginBottom: "10px", fontSize: "18px" }}>
                  Direct Payouts (0% Custody)
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
                  You own your keys and your coins. Funds settle straight into your self-custody hardware or multi-sig
                  wallet destination without custodial intermediary holding.
                </p>
                <div style={{ fontSize: "13px", color: "#10B981", fontWeight: 600 }}>
                  ✓ Native SegWit & EVM Vaults
                </div>
              </div>

              {/* Feature 3 */}
              <div className="glass-card" style={{ padding: "32px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(99, 102, 241, 0.12)",
                    border: "1px solid rgba(99, 102, 241, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    marginBottom: "20px",
                  }}
                >
                  📧
                </div>
                <h3 className="text-headline-md" style={{ color: "#F8FAFC", marginBottom: "10px", fontSize: "18px" }}>
                  Automated Nodemailer & Webhooks
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", marginBottom: "16px" }}>
                  Branded payment creation alerts and official digital receipts are delivered instantly to customer emails via Gmail SMTP, with HMAC-SHA512 webhooks for order fulfillment.
                </p>
                <div style={{ fontSize: "13px", color: "#C0C1FF", fontWeight: 600 }}>
                  ✓ Cryptographically Signed IPN
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (3 Steps) */}
        <section id="how-it-works" style={{ padding: "64px 0", background: "rgba(18, 18, 26, 0.4)", borderTop: "1px solid var(--border-glass)" }}>
          <div className="container-constrained">
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div className="badge-pill badge-muted font-mono" style={{ fontSize: "11px", marginBottom: "8px" }}>
                SIMPLE WORKFLOW
              </div>
              <h2 className="text-headline-lg">ForiPay Kaise Kaam Karta Hai (3 Simple Steps)</h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              <div className="glass-card" style={{ padding: "28px" }}>
                <div className="font-mono" style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-accent-cyan)", marginBottom: "12px" }}>
                  01
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#F8FAFC", marginBottom: "8px" }}>
                  Create an Invoice
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Enter the fiat amount ($ USD) and choose the cryptocurrency (BTC, ETH, USDT, SOL). The rate is automatically locked for 15 minutes.
                </p>
              </div>

              <div className="glass-card" style={{ padding: "28px" }}>
                <div className="font-mono" style={{ fontSize: "28px", fontWeight: 800, color: "#C0C1FF", marginBottom: "12px" }}>
                  02
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#F8FAFC", marginBottom: "8px" }}>
                  Buyer Scans & Sends
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  Customer scans the high-contrast SVG QR code. Within 2.8 seconds of broadcasting, the live tracker updates to "Payment Detected".
                </p>
              </div>

              <div className="glass-card" style={{ padding: "28px" }}>
                <div className="font-mono" style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-success-emerald)", marginBottom: "12px" }}>
                  03
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#F8FAFC", marginBottom: "8px" }}>
                  Final Settlement & Receipt
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                  As blocks mine (1/3, 2/3, 3/3), funds settle into your cold vault. An official receipt is dispatched via Nodemailer and your backend receives a signed webhook.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section style={{ padding: "80px 0" }}>
          <div className="container-constrained">
            <div
              className="glass-card-elevated"
              style={{
                padding: "48px 36px",
                textAlign: "center",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                background: "linear-gradient(180deg, rgba(30, 27, 75, 0.4) 0%, rgba(10, 10, 15, 0.8) 100%)",
              }}
            >
              <h2 className="text-headline-lg" style={{ marginBottom: "12px", color: "#F8FAFC" }}>
                Ready to Upgrade Your Crypto Checkout?
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: "560px", margin: "0 auto 28px" }}>
                Create a merchant account today to start accepting Bitcoin, Ethereum, and stablecoins with zero custody and instant mempool notifications.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
                <Link href="/register" className="btn-primary" style={{ padding: "14px 32px", fontSize: "15px" }}>
                  Create Free Merchant Account →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-glass)",
          backgroundColor: "#08080C",
          padding: "24px 0",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}
      >
        <div
          className="container-constrained"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            © 2026 ForiPay (فوری پے) Infrastructure. All rights reserved.
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/login" style={{ color: "var(--text-muted)" }}>Merchant Login</Link>
            <Link href="/register" style={{ color: "var(--text-muted)" }}>Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
