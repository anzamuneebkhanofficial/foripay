"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import QRCodeVisualizer from "@/components/QRCodeVisualizer";
import { truncateHash, getUtcTimestamp } from "@/lib/crypto-utils";
import { isSimulationEnabled } from "@/lib/env";

export default function DashboardTrackerView({ initialOrder, simulationEnabled }) {
  const isSimMode = simulationEnabled !== undefined ? simulationEnabled : isSimulationEnabled();
  const [order, setOrder] = useState(initialOrder);
  const isConfirmed = Boolean(
    order &&
      ((order.confirmations || 0) >= (order.requiredConfirmations || 3) ||
        order.status === "Confirmed")
  );
  const [qrMode, setQrMode] = useState("address"); // "address" | "url"
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(order?.expiresInSeconds || 900);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [logs, setLogs] = useState([
    { ts: "LIVE", tag: "NODE_CONNECTED", text: "Connected to real-time RPC consensus pipeline.", color: "text-muted" },
  ]);

  useEffect(() => {
    setLogs([
      { ts: getUtcTimestamp(), tag: "NODE_CONNECTED", text: "Connected to real-time RPC consensus pipeline.", color: "text-muted" },
    ]);
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // SSE stream
  useEffect(() => {
    let es;
    try {
      es = new EventSource("/api/stream");
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.text) {
            setLogs((prev) => [
              ...prev.slice(-10),
              {
                ts: getUtcTimestamp(),
                tag: data.type || "STATE_UPDATE",
                text: data.text.replace(/\[.*?\]\s*/, ""),
                color: data.level === "emerald" ? "#10B981" : data.level === "cyan" ? "#22D3EE" : "#F59E0B",
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

  const handleCopyAddress = () => {
    if (order?.depositAddress) {
      navigator.clipboard.writeText(order.depositAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const [copiedCustomerLink, setCopiedCustomerLink] = useState(false);
  const [customerPublicUrl, setCustomerPublicUrl] = useState(`/tracker/${order?.id || ""}`);
  const [isSyncing, setIsSyncing] = useState(false);

  // Automatic Background Polling to NOWPayments API via /api/payments/[id]/sync
  useEffect(() => {
    if (!order?.id || isConfirmed) return;

    const interval = setInterval(async () => {
      try {
        setIsSyncing(true);
        const res = await fetch(`/api/payments/${order.id}/sync`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (_) {
      } finally {
        setIsSyncing(false);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [order?.id, isConfirmed]);

  useEffect(() => {
    if (typeof window !== "undefined" && order?.id) {
      setCustomerPublicUrl(`${window.location.origin}/tracker/${order.id}`);
    }
  }, [order?.id]);

  const handleCopyCustomerLink = () => {
    if (typeof window !== "undefined" && order?.id) {
      const fullUrl = `${window.location.origin}/tracker/${order.id}`;
      navigator.clipboard.writeText(fullUrl);
      setCopiedCustomerLink(true);
      setTimeout(() => setCopiedCustomerLink(false), 2500);
    }
  };

  const handleDownloadQr = () => {
    const svg = document.querySelector("#invoice-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 20, 20, 360, 360);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `Invoice-${order?.id || "qr"}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopyRef = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleAdvance = async () => {
    if (!order) return;
    setIsAdvancing(true);
    try {
      const res = await fetch(`/api/payments/${order.id}/advance`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
      }
    } catch (_) {
    } finally {
      setIsAdvancing(false);
    }
  };

  if (!order) {
    return (
      <div style={{ maxWidth: "800px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 className="text-headline-lg" style={{ color: "#F8FAFC", marginBottom: "6px" }}>
            Live Payment Tracker
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Watch real-time unconfirmed blockchain mempool transactions and block finality.
          </p>
        </div>

        <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚡</div>
          <h3 className="text-headline-md" style={{ color: "#F8FAFC", marginBottom: "8px" }}>
            No Active Invoices to Track
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", maxWidth: "440px", margin: "0 auto 24px" }}>
            Currently there are no pending customer invoices. Generate an invoice to monitor live blockchain confirmation status.
          </p>
          <Link href="/dashboard/create-invoice" className="btn-primary" style={{ padding: "10px 24px" }}>
            + Create New Invoice
          </Link>
        </div>
      </div>
    );
  }

  const m = Math.floor(timerSeconds / 60);
  const s = timerSeconds % 60;
  const timeFormatted = `${m}:${String(s).padStart(2, "0")}`;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h1 className="text-headline-lg" style={{ color: "#F8FAFC" }}>
              Live Payment Tracker
            </h1>
            <span
              className={`badge-pill font-mono ${isConfirmed ? "badge-emerald" : "badge-cyan"}`}
              style={{ fontSize: "11px" }}
            >
              <span className={`status-pip ${isConfirmed ? "pip-emerald" : "pip-cyan"}`} />
              {isConfirmed ? "Settlement Finalized" : "Mempool Listening"}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            Order #{order.id} • Customer: {order.customer || "Direct Checkout"}
            {order.nowpaymentsId && (
              <span style={{ color: "#22D3EE", marginLeft: "8px" }}>
                • NOWPayments ID: #{order.nowpaymentsId} {isSyncing ? "(⚡ Syncing...)" : "(✓ Live)"}
              </span>
            )}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {order.invoiceUrl && (
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyan-outline"
              style={{ fontSize: "12px", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              🌐 NOWPayments Hosted ↗
            </a>
          )}
          <button
            onClick={handleCopyCustomerLink}
            className="btn-cyan-outline"
            style={{ fontSize: "12px", padding: "8px 14px", display: "flex", alignItems: "center", gap: "6px" }}
          >
            {copiedCustomerLink ? "✓ Link Copied!" : "🔗 Share Payment Link"}
          </button>
          <Link href="/dashboard/create-invoice" className="btn-cyan-outline" style={{ fontSize: "12px", padding: "8px 14px" }}>
            + New Invoice
          </Link>
          {isSimMode ? (
            <button
              onClick={handleAdvance}
              disabled={isAdvancing || isConfirmed}
              className="btn-primary"
              style={{ fontSize: "12px", padding: "8px 16px" }}
            >
              {isAdvancing
                ? "Confirming..."
                : isConfirmed
                ? "✓ 3/3 Finalized"
                : `⚡ Simulate Next Block (${(order.confirmations || 0) + 1}/${order.requiredConfirmations || 3})`}
            </button>
          ) : isConfirmed ? (
            <div className="badge-pill badge-emerald font-mono" style={{ fontSize: "12px", padding: "8px 14px" }}>
              ✓ 3/3 On-Chain Finalized
            </div>
          ) : (
            <div className="badge-pill badge-cyan font-mono" style={{ fontSize: "12px", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22D3EE" }} />
              📡 Live Network Sync
            </div>
          )}
        </div>
      </div>

      {/* Real-World vs Sandbox Guidance Banner */}
      {isSimMode ? (
        <div
          style={{
            marginBottom: "24px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "rgba(34, 211, 238, 0.04)",
            border: "1px solid rgba(34, 211, 238, 0.2)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "20px", lineHeight: "1" }}>💡</span>
          <div style={{ flex: 1, fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
            <strong style={{ color: "#22D3EE" }}>NOWPayments Dual Engine Active:</strong> Invoices are synchronized directly with NOWPayments API.
            <span style={{ display: "block", marginTop: "4px", color: "var(--text-muted)" }}>
              <strong>Localhost Mode:</strong> Automatic background polling queries NOWPayments API every 8 seconds. You can also click <code style={{ color: "#F8FAFC", background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "4px" }}>⚡ Simulate Next Block</code> to test instant block progression without spending crypto.
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            marginBottom: "24px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "rgba(16, 185, 129, 0.04)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "18px" }}>🛡️</span>
          <div style={{ flex: 1, fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
            <strong style={{ color: "#10B981" }}>Live Production Environment:</strong> Transactions are tracked directly on-chain via NOWPayments Gateway and automated mempool polling.
          </div>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Column: QR Code & Payment Details */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
              Payment Information
            </span>
            <span className="badge-pill badge-muted font-mono" style={{ fontSize: "11px" }}>
              Session Expires: {timeFormatted}
            </span>
          </div>

          {/* Amount Box */}
          <div
            style={{
              padding: "16px",
              background: "#08080C",
              borderRadius: "8px",
              border: "1px solid var(--border-glass)",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Total Due</div>
              <div className="font-mono" style={{ fontSize: "24px", fontWeight: 700, color: "#22D3EE" }}>
                {order.amountCrypto}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Fiat Equivalent</div>
              <div className="font-mono" style={{ fontSize: "16px", fontWeight: 600, color: "#F8FAFC" }}>
                {order.amountFiat}
              </div>
            </div>
          </div>

          {/* QR Code with Address / Link Switcher */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px", gap: "10px" }}>
            <div style={{ display: "flex", background: "#08080C", borderRadius: "8px", padding: "3px", border: "1px solid var(--border-glass)", gap: "4px" }}>
              <button
                type="button"
                onClick={() => setQrMode("address")}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: qrMode === "address" ? "rgba(34, 211, 238, 0.2)" : "transparent",
                  color: qrMode === "address" ? "#22D3EE" : "var(--text-muted)",
                  transition: "all 0.2s ease",
                }}
              >
                🪙 Wallet Address ({order.asset || "Crypto"})
              </button>
              <button
                type="button"
                onClick={() => setQrMode("url")}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  background: qrMode === "url" ? "rgba(34, 211, 238, 0.2)" : "transparent",
                  color: qrMode === "url" ? "#22D3EE" : "var(--text-muted)",
                  transition: "all 0.2s ease",
                }}
              >
                📱 Mobile Payment Link
              </button>
            </div>

            <QRCodeVisualizer
              text={qrMode === "url" ? (customerPublicUrl || order.depositAddress) : (order.depositAddress || "bc1qdemo")}
              size={190}
            />

            <span style={{ fontSize: "11px", color: "var(--text-faint)", textAlign: "center", maxWidth: "270px" }}>
              {qrMode === "url"
                ? "📷 Scan with Phone Camera to open Checkout link directly in mobile browser."
                : "💳 Scan with Binance, Trust Wallet, TronLink, or any Crypto App to transfer."}
            </span>

            <button
              onClick={handleDownloadQr}
              className="btn-cyan-outline"
              style={{
                fontSize: "11px",
                padding: "6px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(34, 211, 238, 0.05)",
              }}
            >
              📥 Download QR Barcode (PNG)
            </button>
          </div>

          {/* Direct Customer Payment URL Box */}
          <div
            style={{
              padding: "14px",
              background: "rgba(34, 211, 238, 0.04)",
              border: "1px solid rgba(34, 211, 238, 0.25)",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#22D3EE", textTransform: "uppercase" }}>
                🌐 Customer Payment Link (Send to Buyer)
              </span>
              <button
                onClick={handleCopyCustomerLink}
                style={{
                  background: copiedCustomerLink ? "rgba(16, 185, 129, 0.2)" : "rgba(34, 211, 238, 0.15)",
                  border: "1px solid rgba(34, 211, 238, 0.4)",
                  color: copiedCustomerLink ? "#10B981" : "#22D3EE",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {copiedCustomerLink ? "✓ Copied!" : "📋 Copy Link"}
              </button>
            </div>
            <div
              className="font-mono"
              suppressHydrationWarning
              style={{
                fontSize: "12px",
                color: "#F8FAFC",
                background: "#08080C",
                padding: "8px 10px",
                borderRadius: "5px",
                border: "1px solid var(--border-glass)",
                wordBreak: "break-all",
              }}
            >
              {customerPublicUrl}
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "6px 0 0" }}>
              💡 Send this link or the downloaded QR code to your customer (e.g. via WhatsApp, Email, or SMS). They will see the payment screen without needing to log in.
            </p>
          </div>

          {/* Deposit Address Box */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
              <span>Deposit Wallet Address ({order.asset || "BTC"})</span>
              <button
                onClick={handleCopyAddress}
                style={{ background: "transparent", border: "none", color: copiedAddress ? "#10B981" : "var(--color-accent-cyan)", cursor: "pointer", fontSize: "12px" }}
              >
                {copiedAddress ? "✓ Copied" : "Copy Address"}
              </button>
            </div>
            <div
              className="font-mono"
              style={{
                background: "#08080C",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-glass)",
                fontSize: "12px",
                color: "#38BDF8",
                wordBreak: "break-all",
              }}
            >
              {order.depositAddress}
            </div>
          </div>
        </div>

        {/* Right Column: Status & Live Block Confirmation Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Progress Card */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 className="text-headline-md" style={{ fontSize: "16px", color: "#F8FAFC" }}>
                Consensus Confirmations
              </h3>
              <span className="font-mono" style={{ fontSize: "13px", fontWeight: 700, color: isConfirmed ? "#10B981" : "#22D3EE" }}>
                {order.confirmations || 0} / {order.requiredConfirmations || 3} Blocks
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div style={{ display: "flex", gap: "6px", height: "10px", marginBottom: "20px" }}>
              {Array.from({ length: order.requiredConfirmations || 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    borderRadius: "4px",
                    background:
                      i < (order.confirmations || 0)
                        ? isConfirmed
                          ? "var(--color-success-emerald)"
                          : "var(--color-accent-cyan)"
                        : "rgba(255, 255, 255, 0.08)",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>

            {/* Step Checkpoints */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: (order.confirmations || 0) >= 0 ? "#10B981" : "var(--text-muted)" }}>✓</span>
                <span style={{ color: "#F8FAFC" }}>Invoice Generated & Rate Locked</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: order.mempoolSeen ? "#10B981" : "var(--text-muted)" }}>
                  {order.mempoolSeen ? "✓" : "○"}
                </span>
                <span style={{ color: order.mempoolSeen ? "#F8FAFC" : "var(--text-muted)" }}>
                  Zero-Conf Mempool Detection: {order.mempoolSeen ? "Detected" : "Listening..."}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: isConfirmed ? "#10B981" : "var(--text-muted)" }}>
                  {isConfirmed ? "✓" : "○"}
                </span>
                <span style={{ color: isConfirmed ? "#10B981" : "var(--text-muted)", fontWeight: isConfirmed ? 600 : 400 }}>
                  Multi-Block Terminal Settlement (Non-Custodial Payout)
                </span>
              </div>
            </div>
          </div>

          {/* Live Node Stream Box */}
          <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#F8FAFC" }}>Real-time Node Event Stream</span>
              <span className="badge-pill badge-cyan font-mono" style={{ fontSize: "10px" }}>SSE Live</span>
            </div>
            <div
              className="font-mono"
              style={{
                background: "#08080C",
                padding: "12px",
                borderRadius: "6px",
                border: "1px solid var(--border-glass)",
                fontSize: "11px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "180px",
                overflowY: "auto",
              }}
            >
              {logs.map((l, idx) => (
                <div key={idx} style={{ display: "flex", gap: "8px" }}>
                  <span style={{ color: "var(--text-muted)" }} suppressHydrationWarning>{l.ts}</span>
                  <span style={{ color: l.color }}>{l.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
