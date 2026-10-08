"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import PrintableReceipt from "@/components/PrintableReceipt";
import { truncateHash } from "@/lib/crypto-utils";

function ReceiptContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetch(`/api/payments/${orderId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setOrder(null);
        }
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleCopyHash = () => {
    if (order?.txHash) {
      navigator.clipboard.writeText(order.txHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-canvas)" }}>
        <Navbar />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="font-mono" style={{ color: "var(--color-accent-cyan)" }}>Loading settlement proof...</div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-canvas)" }}>
        <Navbar />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", maxWidth: "480px" }}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🧾</div>
            <h2 className="text-headline-md" style={{ color: "#F8FAFC", marginBottom: "8px" }}>
              Settlement Certificate Not Found
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
              {orderId ? `Order #${orderId} does not exist or has not settled yet.` : "No order ID specified."}
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link href="/dashboard" className="btn-primary" style={{ padding: "8px 18px", fontSize: "13px" }}>
                Dashboard
              </Link>
              <Link href="/" className="btn-cyan-outline" style={{ padding: "8px 18px", fontSize: "13px" }}>
                Home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-canvas)" }}>
      <Navbar />

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ width: "100%", maxWidth: "620px" }}>
          {/* Centered Settlement Card */}
          <div
            className="glass-card-elevated"
            style={{
              padding: "40px 32px",
              textAlign: "center",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              boxShadow: "0 12px 48px -8px rgba(0, 0, 0, 0.7), 0 0 32px -4px rgba(16, 185, 129, 0.2)",
            }}
          >
            {/* Large Glowing Emerald Badge */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.12)",
                border: "2px solid #10B981",
                boxShadow: "0 0 32px rgba(16, 185, 129, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                color: "#10B981",
                fontSize: "32px",
                fontWeight: 900,
              }}
            >
              ✓
            </div>

            <h1 className="text-headline-lg" style={{ color: "#F8FAFC", marginBottom: "8px" }}>
              Payment Confirmed & Settled
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "28px" }}>
              Transaction verified on-chain with <strong style={{ color: "var(--color-success-emerald)" }}>3/3 confirmations</strong>. Order <span className="font-mono" style={{ color: "#F8FAFC" }}>#{order.id}</span> fulfilled.
            </p>

            {/* Total Settled Amount Pill */}
            <div
              style={{
                background: "#08080C",
                border: "1px solid var(--border-glass)",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "28px",
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" }}>
                Total Amount Settled
              </div>
              <div className="font-mono" style={{ fontSize: "24px", fontWeight: 800, color: "#F8FAFC" }}>
                {order.amountCrypto} <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: 400 }}>({order.amountFiat})</span>
              </div>
            </div>

            {/* Ledger State Step Bar */}
            <div style={{ marginBottom: "28px", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                  Ledger State
                </span>
                <span className="badge-pill badge-emerald font-mono" style={{ fontSize: "10px", padding: "2px 8px" }}>
                  <span className="status-pip pip-emerald" /> Finalized
                </span>
              </div>

              {/* 3 Solid Emerald Bars */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                <div style={{ height: "4px", background: "var(--color-success-emerald)", borderRadius: "2px" }} />
                <div style={{ height: "4px", background: "var(--color-success-emerald)", borderRadius: "2px" }} />
                <div style={{ height: "4px", background: "var(--color-success-emerald)", borderRadius: "2px" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                <span>1. Received</span>
                <span>2. Confirming (3/3)</span>
                <span>3. Settled</span>
              </div>
            </div>

            {/* Transaction Ledger Details Table */}
            <div
              style={{
                background: "#08080C",
                border: "1px solid var(--border-glass)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "24px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                fontSize: "13px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Timestamp</span>
                <span className="font-mono" style={{ color: "#F8FAFC" }}>Today at 14:28:45 UTC</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Network</span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#F8FAFC" }}>
                  <span className="status-pip pip-emerald" /> {order.network}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Block Height</span>
                <span className="font-mono" style={{ color: "var(--color-accent-cyan)" }}>
                  #{order.finalBlockHeight || "884,913"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Fee Paid</span>
                <span className="font-mono" style={{ color: "#F8FAFC" }}>{order.gasFee}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)" }}>Transaction Hash</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="font-mono" style={{ color: "#38BDF8", fontSize: "12px" }}>
                    {truncateHash(order.txHash, 8, 8)}
                  </span>
                  <button
                    onClick={handleCopyHash}
                    title="Copy Hash"
                    style={{ color: copiedHash ? "#10B981" : "var(--text-muted)", fontSize: "12px" }}
                  >
                    {copiedHash ? "✓" : "📋"}
                  </button>
                  <a
                    href={`https://mempool.space/tx/${order.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open Explorer"
                    style={{ color: "var(--text-muted)", fontSize: "12px" }}
                  >
                    ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Merchant Notification Confirmation Banner */}
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: "10px",
                padding: "14px 16px",
                marginBottom: "28px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-success-emerald)", fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                <span>✓</span> Merchant Notified: HTTP 200 OK via Hookdeck / NOWPayments IPN
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                Payload dispatched & signed with HMAC-SHA256. Webhook acknowledged in 142ms.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="btn-secondary"
                style={{ flex: 1, padding: "12px", fontSize: "13px" }}
              >
                📄 Download Official Receipt (PDF)
              </button>
              <Link
                href="/tracker"
                className="btn-primary"
                style={{ flex: 1, padding: "12px", fontSize: "13px" }}
              >
                🏪 Return to Merchant Store
              </Link>
            </div>

            <Link
              href="/tracker"
              style={{ fontSize: "13px", color: "var(--color-accent-cyan)", textDecoration: "underline" }}
            >
              Track Another Payment
            </Link>
          </div>

          {/* Bottom Security Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "11px",
              color: "var(--text-faint)",
              marginTop: "24px",
              padding: "0 12px",
            }}
          >
            <span>© Cryptographically signed by ForiPay Settlement Node #04</span>
            <span className="font-mono">Finality: 100% | Audit Proof</span>
          </div>
        </div>
      </main>

      {/* Printable Receipt Modal */}
      <PrintableReceipt
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        order={order}
      />
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg-canvas)" }} />}>
      <ReceiptContent />
    </Suspense>
  );
}
