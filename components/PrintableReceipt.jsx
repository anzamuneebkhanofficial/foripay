"use client";

import React from "react";

export default function PrintableReceipt({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 10, 15, 0.85)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#FFFFFF",
          color: "#0F172A",
          borderRadius: "12px",
          padding: "36px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
          fontFamily: "var(--font-ui)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Printable Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #E2E8F0", paddingBottom: "20px", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#6366F1" }} />
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0F172A" }}>LedgerPulse</h2>
            </div>
            <p style={{ fontSize: "12px", color: "#64748B" }}>Cryptographic Settlement Infrastructure • Node #04</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ display: "inline-block", background: "#DCFCE7", color: "#15803D", padding: "4px 10px", borderRadius: "9999px", fontSize: "12px", fontWeight: "700" }}>
              ✓ FINALIZED
            </span>
            <div style={{ fontSize: "11px", color: "#64748B", marginTop: "6px", fontFamily: "var(--font-mono)" }}>
              {new Date().toUTCString()}
            </div>
          </div>
        </div>

        {/* Invoice Meta */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px", background: "#F8FAFC", padding: "16px", borderRadius: "8px" }}>
          <div>
            <div style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: "600" }}>Order Reference</div>
            <div style={{ fontSize: "15px", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#0F172A" }}>#{order.id}</div>
          </div>
          <div>
            <div style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", fontWeight: "600" }}>Customer / Beneficiary</div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#0F172A" }}>{order.customer}</div>
          </div>
        </div>

        {/* Amount Settled */}
        <div style={{ textAlign: "center", padding: "20px", background: "#EEF2FF", borderRadius: "8px", marginBottom: "24px", border: "1px solid #C7D2FE" }}>
          <div style={{ fontSize: "12px", color: "#4F46E5", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Amount Settled</div>
          <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#1E1B4B", marginTop: "4px" }}>
            {order.amountCrypto}
          </div>
          <div style={{ fontSize: "13px", color: "#6366F1", marginTop: "2px" }}>
            ~ {order.amountFiat} USD (Multi-Block Finality Reached)
          </div>
        </div>

        {/* Ledger Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px", fontSize: "13px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #E2E8F0", paddingBottom: "6px" }}>
            <span style={{ color: "#64748B" }}>Network Protocol</span>
            <span style={{ fontWeight: "600" }}>{order.network}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #E2E8F0", paddingBottom: "6px" }}>
            <span style={{ color: "#64748B" }}>Consensus Finality</span>
            <span style={{ fontWeight: "700", color: "#16A34A" }}>3 of 3 Blocks Finalized</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #E2E8F0", paddingBottom: "6px" }}>
            <span style={{ color: "#64748B" }}>Block Height</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: "600" }}>#{order.finalBlockHeight || order.blockHeight}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #E2E8F0", paddingBottom: "6px" }}>
            <span style={{ color: "#64748B" }}>Fee Paid</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>{order.gasFee}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingTop: "4px" }}>
            <span style={{ color: "#64748B", fontSize: "11px" }}>Transaction Ledger Hash</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", wordBreak: "break-all", background: "#F1F5F9", padding: "6px 8px", borderRadius: "4px" }}>
              {order.txHash}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #E2E8F0", paddingTop: "20px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px",
              borderRadius: "6px",
              background: "#F1F5F9",
              color: "#475569",
              fontWeight: "600",
              fontSize: "13px",
            }}
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            style={{
              padding: "10px 24px",
              borderRadius: "6px",
              background: "#4F46E5",
              color: "#FFFFFF",
              fontWeight: "600",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🖨️ Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
