"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import QRCodeVisualizer from "@/components/QRCodeVisualizer";
import { truncateHash, getUtcTimestamp } from "@/lib/crypto-utils";
import { isSimulationEnabled } from "@/lib/env";

export default function TrackerView({ initialOrder, simulationEnabled }) {
  const isSimMode = simulationEnabled !== undefined ? simulationEnabled : isSimulationEnabled();
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [qrMode, setQrMode] = useState("web"); // "web" | "wallet"
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(order?.expiresInSeconds || 869);
  const [logs, setLogs] = useState([
    { ts: "14:32:04 UTC", tag: "CONNECT_OK", text: "SSE pipe verified via Node cluster eu-central-1.", color: "text-muted" },
    { ts: "14:32:11 UTC", tag: "MEMPOOL_DIGEST", text: "Received transaction 0x4F9a71a8c9032... in mempool. Output match: 0.04520 BTC.", color: "#22D3EE" },
    { ts: "14:36:20 UTC", tag: "BLOCK_MINED", text: "Block 884911 confirmed (1/3 finality). Proof verified by peer nodes.", color: "#10B981" },
    { ts: "14:41:52 UTC", tag: "STATE_UPDATE", text: "Block 884912 confirmed (2/3 finality). Re-org depth safe. Awaiting terminal consensus.", color: "#F59E0B" },
  ]);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real EventSource for live SSE Ticker
  useEffect(() => {
    let es;
    try {
      es = new EventSource("/api/stream");
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.text) {
            setLogs((prev) => [
              ...prev.slice(-15),
              {
                ts: getUtcTimestamp(),
                tag: data.type || "STATE_UPDATE",
                text: data.text.replace(/\[.*?\]\s*/, ""),
                color: data.level === "emerald" ? "#10B981" : data.level === "cyan" ? "#22D3EE" : data.level === "amber" ? "#F59E0B" : "var(--text-muted)",
              },
            ]);
          }
        } catch (_) {}
      };
    } catch (_) {}

    return () => {
      if (es) es.close();
    };
  }, []);

  // Automatic NOWPayments sync polling for customers
  useEffect(() => {
    if (!order?.id || order.status === "Confirmed") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/${order.id}/sync`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
          if (data.order.status === "Confirmed") {
            router.push(`/receipt?orderId=${data.order.id}`);
          }
        }
      } catch (_) {}
    }, 8000);

    return () => clearInterval(interval);
  }, [order?.id, order?.status, router]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(order.depositAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const getQrText = () => {
    if (qrMode === "web") {
      if (order?.invoiceUrl) return order.invoiceUrl;
      if (typeof window !== "undefined") return window.location.href;
      return `http://localhost:3000/tracker/${order?.id || ""}`;
    }
    const addr = order?.depositAddress || "";
    if (order?.asset === "BTC") {
      return `bitcoin:${addr}?amount=${order?.amountCryptoNum || ""}`;
    }
    return addr;
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Simulate advancing confirmation state to test 3/3 finality
  const handleAdvance = async () => {
    setIsAdvancing(true);
    try {
      const res = await fetch(`/api/payments/${order.id}/advance`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
        if (data.data.status === "Confirmed") {
          router.push(`/receipt?orderId=${data.data.id}`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdvancing(false);
    }
  };

  if (!order) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-canvas)" }}>
        <Navbar />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", maxWidth: "500px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚡</div>
            <h2 className="text-headline-md" style={{ color: "#F8FAFC", marginBottom: "8px" }}>
              No Active Payment Tracker
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
              Koi active crypto payment session nahi mila. Naya invoice generate karein taake real-time mempool aur block finality track ki ja sake.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link href="/checkout" className="btn-primary" style={{ padding: "10px 20px" }}>
                + Create New Invoice
              </Link>
              <Link href="/dashboard" className="btn-cyan-outline" style={{ padding: "10px 20px" }}>
                Merchant Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isConfirmed = order.status === "Confirmed" || order.confirmations >= (order.requiredConfirmations || 3);
  const isSecondConfirmed = order.confirmations >= 2;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-canvas)" }}>
      <Navbar />

      <main style={{ flex: 1, paddingTop: "88px", paddingBottom: "60px" }}>
        <div className="container-constrained">
          {/* Top Bar & Session Timer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "32px",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  AWAITING FINAL SETTLEMENT
                </span>
                <span className="badge-pill badge-amber font-mono" style={{ fontSize: "11px" }}>
                  <span className="status-pip pip-amber" />
                  {isConfirmed ? "Settled & Verified" : isSecondConfirmed ? "Confirming Block" : "Mempool Detection"}
                </span>
              </div>
              <h1 className="text-headline-xl" style={{ color: "#F8FAFC" }}>
                Live Payment Tracker
              </h1>
            </div>

            {/* Circular Arc Expiration Widget */}
            <div
              className="glass-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "12px 20px",
                borderColor: "rgba(245, 158, 11, 0.25)",
              }}
            >
              {/* Circular Arc SVG */}
              <div style={{ position: "relative", width: "40px", height: "40px" }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="3" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeDasharray="100"
                    strokeDashoffset={100 - (timerSeconds / 900) * 100}
                    strokeLinecap="round"
                    transform="rotate(-90 20 20)"
                  />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                  Session Guarantee
                </div>
                <div className="font-mono" style={{ fontSize: "15px", fontWeight: 700, color: "#F59E0B" }}>
                  Expires in {formatTimer(timerSeconds)}
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.7fr 1fr",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            {/* Left Primary Payment Container */}
            <div className="glass-card" style={{ padding: "28px" }}>
              {/* Top Row: Invoice Reference & Total Due */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderBottom: "1px solid var(--border-glass)",
                  paddingBottom: "20px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" }}>
                    Invoice Reference
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="font-mono" style={{ fontSize: "16px", fontWeight: 700, color: "#F8FAFC" }}>
                      #{order.id}
                    </span>
                    <button
                      onClick={handleCopyRef}
                      title="Copy Reference"
                      style={{ color: copiedRef ? "#10B981" : "var(--text-muted)", padding: "2px" }}
                    >
                      {copiedRef ? "✓" : "📋"}
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" }}>
                    Total Due
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
                    <span
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: "#F59E0B",
                        color: "#000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        fontSize: "12px",
                      }}
                    >
                      ₿
                    </span>
                    <span className="font-mono" style={{ fontSize: "22px", fontWeight: 700, color: "#F8FAFC" }}>
                      {order.amountCrypto}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    ≈ {order.amountFiat} USD
                  </div>
                </div>
              </div>

              {/* Middle Row: QR Code & Deposit Address Tray */}
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                  {/* Mode switcher tabs */}
                  <div style={{ display: "flex", background: "#08080C", borderRadius: "8px", padding: "3px", border: "1px solid var(--border-glass)", gap: "4px" }}>
                    <button
                      type="button"
                      onClick={() => setQrMode("web")}
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "5px 12px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        background: qrMode === "web" ? "rgba(34, 211, 238, 0.2)" : "transparent",
                        color: qrMode === "web" ? "#22D3EE" : "var(--text-muted)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      📱 Mobile Scanner (Link)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrMode("wallet")}
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "5px 12px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        background: qrMode === "wallet" ? "rgba(34, 211, 238, 0.2)" : "transparent",
                        color: qrMode === "wallet" ? "#22D3EE" : "var(--text-muted)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      🪙 Crypto Wallet (Address)
                    </button>
                  </div>

                  <QRCodeVisualizer text={getQrText()} size={170} />

                  <span style={{ fontSize: "11px", color: "var(--text-faint)", textAlign: "center", maxWidth: "230px", lineHeight: "1.4" }}>
                    {qrMode === "web"
                      ? "📷 Normal phone camera ya scanner se scan karein — link foran open ho jayega."
                      : "💳 Binance, Trust Wallet, ya Coinbase app se scan karein — address auto-fill hoga."}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: "260px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                      Standard Native SegWit Deposit Address
                    </span>
                    <span className="badge-pill badge-cyan font-mono" style={{ fontSize: "10px", padding: "2px 8px" }}>
                      ⚡ Instant Mempool Detection
                    </span>
                  </div>

                  {/* Address input tray with inline copy */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#08080C",
                      border: "1px solid var(--border-glass)",
                      borderRadius: "8px",
                      padding: "6px 8px 6px 14px",
                      marginBottom: "12px",
                      gap: "8px",
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{
                        flex: 1,
                        fontSize: "13px",
                        color: "#38BDF8",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.depositAddress}
                    </span>
                    <button onClick={handleCopyAddress} className="btn-copy">
                      {copiedAddress ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>

                  <p style={{ fontSize: "12px", color: "var(--text-faint)", lineHeight: "1.5" }}>
                    Send exact transaction sum. Payments with incomplete gas rates or underpayments will remain held in mempool pending delta settlements.
                  </p>

                  {order.invoiceUrl && (
                    <div style={{ marginTop: "14px" }}>
                      <a
                        href={order.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-cyan-outline"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          padding: "8px 14px",
                          width: "100%",
                          justifyContent: "center",
                          background: "rgba(34, 211, 238, 0.06)",
                        }}
                      >
                        🌐 Or Pay via NOWPayments Hosted Checkout ↗
                      </a>
                    </div>
                  )}

                  {/* Sandbox Mobile Testing Checkout Action (Only shown when simulation is active) */}
                  {isSimMode && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "16px",
                        background: "rgba(34, 211, 238, 0.04)",
                        border: "1px dashed rgba(34, 211, 238, 0.35)",
                        borderRadius: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 700, color: "#22D3EE", display: "flex", alignItems: "center", gap: "6px" }}>
                          🧪 Sandbox Payment Simulator ($0 Free)
                        </span>
                        <span className="badge-pill badge-cyan font-mono" style={{ fontSize: "10px" }}>Sandbox Mode</span>
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 12px 0", lineHeight: "1.4" }}>
                        Aap ke paas crypto wallet nahi hai? Neeche diye gaye button se Khadija ki test payment confirm karein. Ye blockchain block advance karega aur confirmation receipt email bhejega.
                      </p>
                      <button
                        onClick={handleAdvance}
                        disabled={isAdvancing || isConfirmed}
                        className="btn-primary"
                        style={{
                          width: "100%",
                          fontSize: "12px",
                          padding: "10px 16px",
                          justifyContent: "center",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {isAdvancing
                          ? "Broadcasting to Blockchain..."
                          : isConfirmed
                          ? "✓ Payment Completed & Verified"
                          : `⚡ Send Test Payment (Advance Block ${(order.confirmations || 0) + 1}/${order.requiredConfirmations || 3})`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Settlement Ledger State Progress Tracker */}
              <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    SETTLEMENT LEDGER STATE
                  </span>
                  <span className="font-mono" style={{ fontSize: "12px", color: "var(--color-accent-cyan)" }}>
                    {isConfirmed ? "Finality Reached" : "Estimated Finality: ~2 mins remaining"}
                  </span>
                </div>

                {/* Segmented Progress Rails */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                  <div style={{ height: "4px", borderRadius: "2px", background: "var(--color-success-emerald)" }} />
                  <div style={{ height: "4px", borderRadius: "2px", background: isSecondConfirmed ? "var(--color-accent-cyan)" : "rgba(255, 255, 255, 0.1)" }} />
                  <div style={{ height: "4px", borderRadius: "2px", background: isConfirmed ? "var(--color-success-emerald)" : "rgba(255, 255, 255, 0.1)" }} />
                </div>

                {/* 3 Step Boxes */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                  {/* Step 1 */}
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.05)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                      borderRadius: "8px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-success-emerald)", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                      <span>✓</span> Payment Detected
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Tx Seen in Mempool</div>
                    <div className="font-mono" style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: "4px" }}>
                      Hash: {truncateHash(order.txHash, 6, 4)}
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div
                    style={{
                      background: isSecondConfirmed ? "rgba(34, 211, 238, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      border: isSecondConfirmed ? "1px solid rgba(34, 211, 238, 0.3)" : "1px solid var(--border-glass)",
                      borderRadius: "8px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isSecondConfirmed ? "var(--color-accent-cyan)" : "var(--text-muted)", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                      <span className="status-pip pip-cyan" /> Confirmations [ {order.confirmations} / {order.requiredConfirmations || 3} ]
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 500 }}>
                      Block #{order.blockHeight} Validated
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {isConfirmed ? "Consensus reached" : "Awaiting 1 more peer confirmation"}
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div
                    style={{
                      background: isConfirmed ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      border: isConfirmed ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-glass)",
                      borderRadius: "8px",
                      padding: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isConfirmed ? "var(--color-success-emerald)" : "var(--text-muted)", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                      <span>{isConfirmed ? "✓" : "○"}</span> Settled & Verified
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Scheduled Finality</div>
                    <div style={{ fontSize: "11px", color: "var(--text-faint)", marginTop: "4px" }}>
                      Merchant webhook triggers
                    </div>
                  </div>
                </div>

                {/* Bottom Ledger Action */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", marginTop: "20px" }}>
                  {isSimMode ? (
                    <button
                      onClick={handleAdvance}
                      disabled={isAdvancing}
                      className="btn-cyan-outline font-mono"
                      style={{ fontSize: "12px", padding: "8px 16px" }}
                    >
                      {isAdvancing ? "Validating Block..." : isConfirmed ? "View Final Receipt →" : "⚡ Simulate Peer Block Mine (+1)"}
                    </button>
                  ) : !isConfirmed ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--color-accent-cyan)" }} className="font-mono">
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22D3EE", boxShadow: "0 0 8px #22D3EE" }} />
                      Awaiting On-Chain Finality...
                    </div>
                  ) : null}
                  {isConfirmed && (
                    <Link href={`/receipt?orderId=${order.id}`} className="btn-primary" style={{ fontSize: "13px" }}>
                      View Settled Receipt →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Right Telemetry & Assurance Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Card 1: Network Telemetry */}
              <div className="glass-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--color-accent-cyan)" }}>📡</span>
                    <h3 className="text-headline-md" style={{ fontSize: "17px", color: "#F8FAFC" }}>
                      Network Telemetry
                    </h3>
                  </div>
                  <span className="status-pip pip-cyan" />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Current Block Height</span>
                    <span className="font-mono" style={{ fontSize: "13px", fontWeight: 600, color: "#F8FAFC" }}>
                      #{order.blockHeight}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Network Fee Priority</span>
                    <span className="font-mono" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-success-emerald)" }}>
                      22.4 sat/vB (High)
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Gas / Mining Rate</span>
                    <span className="font-mono" style={{ fontSize: "13px", fontWeight: 600, color: "#F8FAFC" }}>
                      {order.gasFee}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Mempool Position</span>
                    <span className="font-mono" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-accent-cyan)" }}>
                      Top 5% Blocks
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Consensus Engine</span>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>
                      Nakamoto Proof-of-Work
                    </span>
                  </div>
                </div>

                <a
                  href={`https://mempool.space/tx/${order.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{
                    width: "100%",
                    marginTop: "24px",
                    display: "flex",
                    justifyContent: "center",
                    fontSize: "13px",
                  }}
                >
                  Inspect on Mempool.space ↗
                </a>
              </div>

              {/* Card 2: Cryptographic Assurance */}
              <div
                className="glass-card"
                style={{
                  padding: "24px",
                  border: "1px solid rgba(34, 211, 238, 0.2)",
                  background: "rgba(18, 18, 26, 0.7)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "rgba(34, 211, 238, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-accent-cyan)",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    🛡️
                  </div>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#F8FAFC", marginBottom: "6px" }}>
                      Cryptographic Assurance
                    </h4>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                      LedgerPulse enforces a strict 3-block reorganization defense window before dispatching API webhooks to downstream order fulfillment services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Activity Stream: SSE Execution Ticker */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="status-pip pip-cyan" />
                <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", color: "#F8FAFC", textTransform: "uppercase" }}>
                  SERVER-SENT EVENTS (SSE) EXECUTION TICKER
                </span>
              </div>
              <span className="font-mono" style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Channel: sse://stream.ledgerpulse.io/v2/tx-9842
              </span>
            </div>

            {/* Terminal Window */}
            <div
              className="font-mono"
              style={{
                background: "#08080C",
                border: "1px solid var(--border-glass)",
                borderRadius: "8px",
                padding: "16px",
                maxHeight: "160px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: "12px",
              }}
            >
              {logs.map((log, idx) => (
                <div key={idx} style={{ display: "flex", gap: "10px" }}>
                  <span style={{ color: "var(--text-faint)", flexShrink: 0 }}>[{log.ts}]</span>
                  <span style={{ color: log.color, fontWeight: 600, flexShrink: 0 }}>{log.tag}</span>
                  <span style={{ color: "var(--text-secondary)" }}>{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
