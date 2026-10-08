"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import { ASSET_RATES, calculateCryptoAmount } from "@/lib/crypto-utils";
import { invoiceCreateSchema } from "@/lib/validations";
import { isSimulationEnabled } from "@/lib/env";

export default function DashboardCreateInvoicePage() {
  const router = useRouter();
  const isSimMode = isSimulationEnabled();
  const [orderRef, setOrderRef] = useState("ORD-SYNC-INIT");

  React.useEffect(() => {
    setOrderRef(`ORD-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(invoiceCreateSchema),
    defaultValues: {
      amountFiat: 100.0,
      fiatCurrency: "USD",
      asset: "BTC",
      customerEmail: "",
      customerRef: "client_order",
      webhookEndpoint: "https://api.mystore.com/webhooks/crypto",
    },
  });

  const fiatAmount = watch("amountFiat") || 0;
  const currency = watch("fiatCurrency") || "USD";
  const selectedAsset = watch("asset") || "BTC";

  const calculatedCrypto = calculateCryptoAmount(fiatAmount, selectedAsset);
  const currentAssetMeta = ASSET_RATES[selectedAsset] || ASSET_RATES.BTC;

  const onSubmit = async (data) => {
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderRef,
          amountFiat: data.amountFiat,
          fiatCurrency: data.fiatCurrency,
          asset: data.asset,
          customerEmail: data.customerEmail,
          customerRef: data.customerRef,
          webhookEndpoint: data.webhookEndpoint,
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        toast.success(`Invoice #${resData.data.id} created! Opening live tracker.`);
        router.push(`/dashboard/tracker/${resData.data.id}`);
      } else {
        throw new Error(resData.message || "Failed to generate invoice");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create invoice");
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 className="text-headline-lg" style={{ color: "#F8FAFC", marginBottom: "6px" }}>
          Create Crypto Invoice
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Generate a non-custodial crypto payment request with instant blockchain mempool detection.
        </p>
      </div>

      {/* Real-World vs Sandbox Guidance Banner */}
      {isSimMode ? (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "rgba(34, 211, 238, 0.04)",
            border: "1px solid rgba(34, 211, 238, 0.2)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "20px", lineHeight: 1 }}>💡</span>
          <div style={{ flex: 1, fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            <strong style={{ color: "#22D3EE" }}>Real-World Flow vs Local Testing:</strong> When you generate this invoice, you get a direct payment link and QR code to share with your customer.
            <span style={{ display: "block", marginTop: "3px", color: "var(--text-muted)" }}>
              • <strong>In Real World:</strong> Your customer sends crypto from their wallet (Binance, MetaMask, Trust Wallet), and blockchain miners verify the transaction automatically.
              <br />
              • <strong>In Local Testing:</strong> You can click the <em>'⚡ Simulate Next Block'</em> button on the tracker to instantly test block confirmations (1/3 → 2/3 → 3/3) without waiting 30 minutes!
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            borderRadius: "10px",
            background: "rgba(16, 185, 129, 0.05)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "20px", lineHeight: 1 }}>🛡️</span>
          <div style={{ flex: 1, fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            <strong style={{ color: "#10B981" }}>Live Production Payment Flow:</strong> Invoices generated here connect directly to NOWPayments mainnet API with real deposit addresses. When your customer pays via crypto wallet, decentralized nodes package and settle the transaction automatically.
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="glass-card" style={{ padding: "32px", border: "1px solid var(--border-glass)" }}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          
          {/* Order ID Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              background: "rgba(34, 211, 238, 0.05)",
              border: "1px solid rgba(34, 211, 238, 0.2)",
              borderRadius: "8px",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Generated Order Reference</span>
              <div className="font-mono" suppressHydrationWarning style={{ fontSize: "14px", fontWeight: 700, color: "#22D3EE" }}>
                #{orderRef}
              </div>
            </div>
            <span className="badge-pill badge-cyan font-mono" style={{ fontSize: "11px" }}>
              Active Rate Lock (15m)
            </span>
          </div>

          {/* Amount & Currency */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>
                Amount to Bill (Fiat)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("amountFiat")}
                className="input-field font-mono"
                style={{ fontSize: "16px", fontWeight: 700 }}
              />
              {errors.amountFiat && (
                <span style={{ fontSize: "12px", color: "#EF4444", marginTop: "4px", display: "block" }}>
                  {errors.amountFiat.message}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>
                Currency
              </label>
              <select
                {...register("fiatCurrency")}
                className="input-field font-mono"
                style={{ fontSize: "14px" }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="PKR">PKR (Rs)</option>
              </select>
            </div>
          </div>

          {/* Asset Selection */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>
              Receiving Crypto Asset
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {[
                { symbol: "BTC", label: "Bitcoin", icon: "₿" },
                { symbol: "ETH", label: "Ethereum", icon: "Ξ" },
                { symbol: "USDT", label: "Tether USD", icon: "₮" },
                { symbol: "TRX", label: "Tron (Low Fee)", icon: "⚡" },
              ].map((item) => {
                const isSelected = selectedAsset === item.symbol;
                return (
                  <label
                    key={item.symbol}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      padding: "12px 8px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: isSelected ? "1px solid #22D3EE" : "1px solid var(--border-glass)",
                      background: isSelected ? "rgba(34, 211, 238, 0.1)" : "rgba(255, 255, 255, 0.02)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <input
                      type="radio"
                      value={item.symbol}
                      {...register("asset")}
                      style={{ display: "none" }}
                    />
                    <span style={{ fontSize: "18px", marginBottom: "4px" }}>{item.icon}</span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: isSelected ? "#22D3EE" : "#F8FAFC" }}>
                      {item.symbol}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{item.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Live Calculated Output Box */}
          <div
            style={{
              padding: "16px",
              background: "#08080C",
              border: "1px solid var(--border-glass)",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>
                Calculated Customer Payment
              </div>
              <div className="font-mono" style={{ fontSize: "20px", fontWeight: 700, color: "#22D3EE" }}>
                {calculatedCrypto} {selectedAsset}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "2px" }}>Exchange Rate</div>
              <div className="font-mono" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                1 {selectedAsset} = ${currentAssetMeta.rateUsd.toLocaleString()} USD
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>
                Customer Email (Optional Receipt)
              </label>
              <input
                type="email"
                {...register("customerEmail")}
                placeholder="client@company.com"
                className="input-field"
                style={{ fontSize: "13px" }}
              />
              <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                💡 <strong>Real World:</strong> Automatic cryptographic receipt is emailed here once 3/3 blocks finalize.
              </span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>
                Reference / Invoice Note
              </label>
              <input
                type="text"
                {...register("customerRef")}
                placeholder="Order #1042"
                className="input-field"
                style={{ fontSize: "13px" }}
              />
              <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                💡 <strong>Real World:</strong> Your internal order identifier (e.g. Order #1042) to match who paid.
              </span>
            </div>
          </div>

          {/* Webhook Endpoint */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>
              Instant IPN Webhook URL
            </label>
            <input
              type="url"
              {...register("webhookEndpoint")}
              placeholder="https://yourstore.com/api/crypto-ipn"
              className="input-field font-mono"
              style={{ fontSize: "13px" }}
            />
            <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              💡 <strong>Real World:</strong> Your server receives an automatic HTTPS POST callback when blocks confirm to fulfill orders hands-free.
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{
              padding: "14px",
              fontSize: "14px",
              fontWeight: 700,
              width: "100%",
              justifyContent: "center",
              marginTop: "8px",
            }}
          >
            {isSubmitting ? "Generating Invoice..." : "⚡ Generate Live Invoice & Launch Tracker →"}
          </button>
        </form>
      </div>
    </div>
  );
}
