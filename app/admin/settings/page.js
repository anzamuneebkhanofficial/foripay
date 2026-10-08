"use client";

import React, { useState } from "react";

export default function SettingsPage() {
  const [networkMode, setNetworkMode] = useState("Mainnet");
  const [btcColdVault, setBtcColdVault] = useState("bc1qvault983ks09f2k03jf02jf920jf02jf920jf92");
  const [ethColdVault, setEthColdVault] = useState("0x49c952F39180fFa218D15A5237C0d7B190e29490");
  const [webhookSecret, setWebhookSecret] = useState("sec_live_90F0be4188fa9021");
  const [saveStatus, setSaveStatus] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setSaveStatus("✓ Configuration cryptographically synced to Node Cluster");
    setTimeout(() => setSaveStatus(""), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="text-headline-lg" style={{ color: "#F8FAFC", marginBottom: "4px" }}>
          Platform & Node Settings
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Configure multi-chain consensus RPC sockets, cold-vault settlement destinations, and cryptographic secrets.
        </p>
      </div>

      <div className="glass-card" style={{ maxWidth: "800px", padding: "32px" }}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Network Selection */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
              Active Network Mode
            </label>
            <div style={{ display: "flex", gap: "8px", background: "#0E0E14", padding: "4px", borderRadius: "8px", maxWidth: "340px" }}>
              {["Mainnet", "Testnet / Sepolia"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setNetworkMode(mode)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: networkMode === mode ? "#FFFFFF" : "var(--text-muted)",
                    background: networkMode === mode ? "var(--color-primary)" : "transparent",
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Zero-Custodial Cold Vault Forwarding Addresses */}
          <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
            <h3 className="text-headline-md" style={{ fontSize: "16px", color: "#F8FAFC", marginBottom: "12px" }}>
              Cold Vault Forwarding Destinations
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Incoming settlements forward automatically to these multi-sig hardware vaults upon reaching 3/3 finality.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Bitcoin Multi-Sig Cold Vault (Native SegWit)
                </label>
                <input
                  type="text"
                  value={btcColdVault}
                  onChange={(e) => setBtcColdVault(e.target.value)}
                  className="input-field font-mono"
                  style={{ fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Ethereum Safe Vault (ERC-20 / EVM)
                </label>
                <input
                  type="text"
                  value={ethColdVault}
                  onChange={(e) => setEthColdVault(e.target.value)}
                  className="input-field font-mono"
                  style={{ fontSize: "13px" }}
                />
              </div>
            </div>
          </div>

          {/* API Keys & HMAC Secret */}
          <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
            <h3 className="text-headline-md" style={{ fontSize: "16px", color: "#F8FAFC", marginBottom: "12px" }}>
              API Secrets & HMAC Key
            </h3>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>
                Production IPN Signing Key
              </label>
              <input
                type="text"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="input-field font-mono"
                style={{ fontSize: "13px" }}
              />
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px" }}>
            <span style={{ fontSize: "13px", color: "var(--color-success-emerald)", fontWeight: 600 }}>
              {saveStatus}
            </span>
            <button type="submit" className="btn-primary" style={{ padding: "10px 24px", fontSize: "14px" }}>
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
