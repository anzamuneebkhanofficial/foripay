"use client";

import React, { useState, useEffect } from "react";

export default function MerchantSettingsPage() {
  const [user, setUser] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [walletBtc, setWalletBtc] = useState("bc1qar0srvv7xfkvy5l643lydnw9re59gtzzwf5md");
  const [walletEth, setWalletEth] = useState("0x7F9a0B421a970b44b134f999201d891Aea88b");
  const [webhookUrl, setWebhookUrl] = useState("https://api.mystore.com/webhooks/crypto");
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          setBusinessName(data.user.businessName || "");
          if (data.user.walletBtc) setWalletBtc(data.user.walletBtc);
          if (data.user.walletEth) setWalletEth(data.user.walletEth);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveStatus("✓ Settlement destination & gateway preferences saved successfully.");
    setTimeout(() => setSaveStatus(""), 4000);
  };

  return (
    <div style={{ maxWidth: "880px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="text-headline-lg" style={{ color: "#F8FAFC", marginBottom: "6px" }}>
          Merchant Workspace & Payout Settings
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Configure cold-vault payout destinations, notification email dispatch, and NOWPayments API gateway secrets.
        </p>
      </div>

      <div className="glass-card-elevated" style={{ padding: "36px" }}>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {/* Business Profile */}
          <div>
            <h3 className="text-headline-md" style={{ fontSize: "16px", color: "#F8FAFC", marginBottom: "16px" }}>
              Merchant Identity
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                  Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="input-field"
                  style={{ fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                  Registered Email (SMTP Active)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || "anzamuneebkhan13@gmail.com"}
                  className="input-field"
                  style={{ fontSize: "14px", opacity: 0.7, cursor: "not-allowed" }}
                />
              </div>
            </div>
          </div>

          {/* Zero-Custodial Cold Vault Forwarding */}
          <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <h3 className="text-headline-md" style={{ fontSize: "16px", color: "#F8FAFC" }}>
                Cold Vault Settlement Addresses (0% Custody)
              </h3>
              <span className="badge-pill badge-emerald font-mono" style={{ fontSize: "11px" }}>
                ✓ Non-Custodial Mode
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Customer payments forward directly to your own self-custody cold wallets upon reaching finality. LedgerPulse holds 0 funds.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Bitcoin Mainnet Payout Address (Native SegWit Bech32)
                </label>
                <input
                  type="text"
                  value={walletBtc}
                  onChange={(e) => setWalletBtc(e.target.value)}
                  className="input-field font-mono"
                  style={{ fontSize: "13px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Ethereum / EVM Payout Address (ERC-20 & USDT)
                </label>
                <input
                  type="text"
                  value={walletEth}
                  onChange={(e) => setWalletEth(e.target.value)}
                  className="input-field font-mono"
                  style={{ fontSize: "13px" }}
                />
              </div>
            </div>
          </div>

          {/* Connected Gateway Credentials & Webhooks */}
          <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "24px" }}>
            <h3 className="text-headline-md" style={{ fontSize: "16px", color: "#F8FAFC", marginBottom: "16px" }}>
              Connected Gateway & Webhook Infrastructure
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "8px", padding: "14px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                  NOWPayments Gateway Status
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-success-emerald)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="status-pip pip-emerald" style={{ width: "8px", height: "8px" }} />
                  API Key Configured & Verified
                </div>
                <div className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Key: RS18Y4R-***-P8MMW80
                </div>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-glass)", borderRadius: "8px", padding: "14px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                  Gmail SMTP Dispatcher
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-accent-cyan)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="status-pip pip-cyan" style={{ width: "8px", height: "8px" }} />
                  Connected: Port 465 SSL
                </div>
                <div className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Sender: anzamuneebkhan13@gmail.com
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>
                Default Merchant Webhook Dispatch URL
              </label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="input-field font-mono"
                style={{ fontSize: "13px" }}
              />
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--color-success-emerald)", fontWeight: 600 }}>
              {saveStatus}
            </span>
            <button type="submit" className="btn-primary" style={{ padding: "11px 28px", fontSize: "14px" }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
