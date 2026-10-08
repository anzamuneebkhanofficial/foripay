"use client";

import React, { useState } from "react";

export default function ConnectNodeModal({ isOpen, onClose }) {
  const [network, setNetwork] = useState("Mainnet");
  const [activeTab, setActiveTab] = useState("Bitcoin");
  const [pingStatus, setPingStatus] = useState("idle");
  const [pingLatency, setPingLatency] = useState(32);

  if (!isOpen) return null;

  const testPing = () => {
    setPingStatus("testing");
    setTimeout(() => {
      setPingLatency(Math.floor(25 + Math.random() * 18));
      setPingStatus("success");
    }, 700);
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
          maxWidth: "540px",
          padding: "28px",
          border: "1px solid rgba(34, 211, 238, 0.2)",
          boxShadow: "0 12px 48px -8px rgba(0, 0, 0, 0.8), 0 0 24px -4px rgba(34, 211, 238, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="status-pip pip-cyan" />
            <h3 className="text-headline-md" style={{ color: "var(--text-primary)" }}>Connect Settlement Node</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              color: "var(--text-muted)",
              fontSize: "20px",
              padding: "4px 8px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.05)",
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.5", marginBottom: "20px" }}>
          Establish high-throughput RPC sockets for zero-latency mempool tracking, block finality validation, and instant HMAC IPN webhook relay.
        </p>

        {/* Network Toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", background: "#0E0E14", padding: "4px", borderRadius: "8px" }}>
          {["Mainnet", "Testnet / Sepolia"].map((net) => (
            <button
              key={net}
              onClick={() => setNetwork(net)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 600,
                color: network === net ? "#FFFFFF" : "var(--text-muted)",
                background: network === net ? "var(--color-primary)" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              {net}
            </button>
          ))}
        </div>

        {/* Protocol Tabs */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-glass)", marginBottom: "20px" }}>
          {["Bitcoin Core", "Ethereum Geth", "Solana RPC"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: 600,
                color: activeTab === tab ? "var(--color-accent-cyan)" : "var(--text-muted)",
                borderBottom: activeTab === tab ? "2px solid var(--color-accent-cyan)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Node Configuration Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
              RPC Gateway Endpoint
            </label>
            <input
              type="text"
              readOnly
              value={
                activeTab === "Bitcoin Core"
                  ? "https://btc-node-cluster.ledgerpulse.io:8332"
                  : activeTab === "Ethereum Geth"
                  ? "wss://eth-mainnet.alchemyapi.io/v2/live-stream"
                  : "https://api.mainnet-beta.solana.com"
              }
              className="input-field font-mono"
              style={{ fontSize: "12px", color: "var(--text-primary)" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div style={{ background: "#0E0E14", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Active Sync State</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-success-emerald)", fontWeight: 600, fontSize: "13px" }}>
                <span className="status-pip pip-emerald" /> 100% Synced
              </div>
            </div>
            <div style={{ background: "#0E0E14", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Round-Trip Ping</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-accent-cyan)", fontWeight: 600, fontSize: "13px" }}>
                <span className="font-mono">{pingLatency}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={testPing}
            className="btn-secondary"
            style={{ fontSize: "13px" }}
          >
            {pingStatus === "testing" ? "Testing Ping..." : "⚡ Test Connection"}
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={onClose} className="btn-secondary" style={{ fontSize: "13px" }}>
              Dismiss
            </button>
            <button onClick={onClose} className="btn-primary" style={{ fontSize: "13px" }}>
              Save & Authenticate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
