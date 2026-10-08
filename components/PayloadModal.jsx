"use client";

import React, { useState } from "react";

export default function PayloadModal({ isOpen, onClose, payload, title = "Inspect Payload" }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonStr = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 10, 15, 0.8)",
        backdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-card-elevated"
        style={{
          width: "100%",
          maxWidth: "600px",
          padding: "24px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="status-pip pip-cyan" />
            <h3 className="text-headline-md" style={{ color: "var(--text-primary)" }}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              color: "var(--text-muted)",
              fontSize: "18px",
              padding: "4px 8px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.05)",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ position: "relative", marginBottom: "20px" }}>
          <pre
            className="font-mono"
            style={{
              background: "#08080C",
              border: "1px solid var(--border-glass)",
              borderRadius: "8px",
              padding: "16px",
              color: "#38BDF8",
              fontSize: "12px",
              lineHeight: "1.6",
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {jsonStr}
          </pre>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <button onClick={handleCopy} className="btn-secondary" style={{ fontSize: "13px" }}>
            {copied ? "✓ Copied JSON" : "📋 Copy Raw JSON"}
          </button>
          <button onClick={onClose} className="btn-primary" style={{ fontSize: "13px" }}>
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
