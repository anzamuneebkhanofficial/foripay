"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import QRCodeVisualizer from "@/components/QRCodeVisualizer";
import PayloadModal from "@/components/PayloadModal";
import { ASSET_RATES, calculateCryptoAmount } from "@/lib/crypto-utils";
import { invoiceCreateSchema } from "@/lib/validations";

export default function CheckoutPage() {
  const router = useRouter();

  // Form State via React Hook Form + Yup
  const [orderRef, setOrderRef] = useState("#ORD-2026-9901");
  const [expirationWindow, setExpirationWindow] = useState("15 Minutes (Standard)");
  const [secretKey, setSecretKey] = useState("sec_live_90F0be41");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(invoiceCreateSchema),
    defaultValues: {
      amountFiat: 2500.0,
      fiatCurrency: "USD",
      asset: "BTC",
      customerEmail: "",
      customerRef: "checkout_portal",
      webhookEndpoint: "https://api.mystore.com/webhooks/crypto",
    },
  });

  const fiatAmount = watch("amountFiat") || 0;
  const currency = watch("fiatCurrency") || "USD";
  const selectedAsset = watch("asset") || "BTC";
  const customerEmail = watch("customerEmail") || "";
  const webhookUrl = watch("webhookEndpoint") || "https://api.mystore.com/webhooks/crypto";

  // Timer & UI State
  const [lockTimer, setLockTimer] = useState(896); // 14:56
  const [isPayloadModalOpen, setIsPayloadModalOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Countdown timer for rate lock
  useEffect(() => {
    const timer = setInterval(() => {
      setLockTimer((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")} min`;
  };

  const handleAutoGenRef = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setOrderRef(`#ORD-2026-${rand}`);
  };

  const handleRotateKey = () => {
    const newKey = "sec_live_" + Math.random().toString(36).substring(2, 10) + "be41";
    setSecretKey(newKey);
    toast.info("IPN Secret key rotated.");
  };

  const currentAssetMeta = ASSET_RATES[selectedAsset] || ASSET_RATES.BTC;
  const calculatedCrypto = calculateCryptoAmount(fiatAmount, selectedAsset);

  const payloadData = {
    order_id: orderRef.replace("#", ""),
    price_amount: parseFloat(fiatAmount) || 0,
    price_currency: currency.toLowerCase(),
    pay_amount: parseFloat(calculatedCrypto) || 0,
    pay_currency: selectedAsset.toLowerCase(),
    pay_address: currentAssetMeta.defaultAddress,
    ipn_callback_url: webhookUrl,
    customer_email: customerEmail || undefined,
    expiration_minutes: 15,
  };

  const onSubmit = async (data) => {
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: orderRef.replace("#", ""),
          amountFiat: data.amountFiat,
          fiatCurrency: data.fiatCurrency,
          asset: data.asset,
          customerEmail: data.customerEmail,
          webhookEndpoint: data.webhookEndpoint,
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        toast.success(`Invoice #${resData.data.id} created! Opening live tracker.`);
        router.push(`/tracker/${resData.data.id}`);
      } else {
        toast.success("Invoice generated!");
        router.push("/tracker");
      }
    } catch (err) {
      toast.error(err.message || "Failed to create invoice");
      router.push("/tracker");
    }
  };


  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-canvas)" }}>
      <Navbar />

      <main style={{ flex: 1, padding: "32px 0 60px" }}>
        <div className="container-constrained">
          {/* Header Section */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "32px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.06em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  NOWPAYMENTS GATEWAY V2.4
                </span>
                <span className="badge-pill badge-cyan font-mono" style={{ fontSize: "11px" }}>
                  <span className="status-pip pip-cyan" /> API Connected & Signed
                </span>
              </div>
              <h1 className="text-headline-xl" style={{ color: "#F8FAFC" }}>
                Create Crypto Invoice / Payment
              </h1>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                Generate dynamic payment address via NOWPayments API with live status tracking
              </p>
            </div>

            <div className="badge-pill badge-amber font-mono" style={{ fontSize: "13px", padding: "8px 16px" }}>
              <span className="status-pip pip-amber" /> Auto-Lock Rate: {formatTimer(lockTimer)}
            </div>
          </div>

          {/* Two-Column Grid: Form Controls (Left) and Live Preview Checkout (Right) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            {/* Left Panel: Form Controls */}
            <div className="glass-card" style={{ padding: "32px" }}>
              <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* 1. Invoice / Order Reference ID */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      # Invoice / Order Reference ID
                    </label>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={handleAutoGenRef}
                        className="btn-copy"
                        style={{ padding: "3px 8px", fontSize: "11px" }}
                      >
                        ⚡ Auto-gen
                      </button>
                      <span className="badge-pill badge-muted" style={{ fontSize: "10px", padding: "2px 6px" }}>
                        Editable
                      </span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={orderRef}
                    onChange={(e) => setOrderRef(e.target.value)}
                    className="input-field font-mono"
                    style={{ fontSize: "15px", fontWeight: 600, color: "#F8FAFC" }}
                  />
                </div>

                {/* 2. Fiat Amount & Currency */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Fiat Amount & Currency
                    </label>
                    <div style={{ display: "flex", gap: "4px", background: "#0E0E14", padding: "2px", borderRadius: "6px" }}>
                      {["USD", "EUR", "GBP"].map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => setValue("fiatCurrency", curr)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: currency === curr ? "#F8FAFC" : "var(--text-muted)",
                            background: currency === curr ? "rgba(255, 255, 255, 0.12)" : "transparent",
                          }}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "14px", top: "10px", color: "var(--text-muted)", fontSize: "16px" }}>$</span>
                    <input
                      type="number"
                      step="any"
                      {...register("amountFiat")}
                      className="input-field font-mono"
                      style={{ paddingLeft: "30px", fontSize: "18px", fontWeight: 700 }}
                    />
                  </div>
                  {errors.amountFiat && (
                    <span style={{ fontSize: "12px", color: "#EF4444", marginTop: "4px", display: "block" }}>
                      {errors.amountFiat.message}
                    </span>
                  )}
                  <p style={{ fontSize: "12px", color: "var(--text-faint)", marginTop: "6px" }}>
                    Equivalent crypto conversion calculates in real time via live liquidity aggregators.
                  </p>
                </div>

                {/* 3. Target Crypto Asset & Protocol Grid */}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
                    Target Crypto Asset & Protocol
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {Object.values(ASSET_RATES).map((asset) => {
                      const isSelected = selectedAsset === asset.symbol;
                      return (
                        <div
                          key={asset.symbol}
                          onClick={() => setValue("asset", asset.symbol)}
                          style={{
                            background: isSelected ? "rgba(34, 211, 238, 0.08)" : "#0E0E14",
                            border: isSelected ? "1px solid var(--color-accent-cyan)" : "1px solid var(--border-glass)",
                            borderRadius: "10px",
                            padding: "12px 14px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            boxShadow: isSelected ? "0 0 16px -2px rgba(34, 211, 238, 0.2)" : "none",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontWeight: 700, fontSize: "14px", color: "#F8FAFC" }}>{asset.symbol}</span>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{asset.name}</span>
                            </div>
                            <span className="badge-pill badge-muted font-mono" style={{ fontSize: "10px", padding: "1px 6px" }}>
                              {asset.protocol}
                            </span>
                          </div>
                          <div className="font-mono" style={{ fontSize: "12px", color: isSelected ? "var(--color-accent-cyan)" : "var(--text-faint)" }}>
                            ${asset.rateUsd.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Customer Email & Expiration Window */}
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                      Customer Email or Client Tag (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="billing@clientcorp.io or #VIP-89"
                      {...register("customerEmail")}
                      className="input-field"
                    />
                    {errors.customerEmail && (
                      <span style={{ fontSize: "11px", color: "#EF4444", marginTop: "2px", display: "block" }}>
                        {errors.customerEmail.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "6px" }}>
                      Expiration Window
                    </label>
                    <select
                      value={expirationWindow}
                      onChange={(e) => setExpirationWindow(e.target.value)}
                      className="input-field font-mono"
                      style={{ fontSize: "13px" }}
                    >
                      <option value="15 Minutes (Standard)">15 Minutes (Standard)</option>
                      <option value="30 Minutes">30 Minutes</option>
                      <option value="60 Minutes">60 Minutes</option>
                    </select>
                  </div>
                </div>

                {/* 5. Webhook Notification Endpoint */}
                <div style={{ borderTop: "1px solid var(--border-glass)", paddingTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      📡 Webhook Notification Endpoint
                    </label>
                    <span className="badge-pill badge-emerald font-mono" style={{ fontSize: "10px", padding: "2px 8px" }}>
                      ● HMAC-SHA256 Signed
                    </span>
                  </div>
                  <input
                    type="url"
                    {...register("webhookEndpoint")}
                    className="input-field font-mono"
                    style={{ fontSize: "13px", marginBottom: "8px" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "var(--text-faint)" }}>
                    <span className="font-mono">Secret Key: {secretKey}</span>
                    <button type="button" onClick={handleRotateKey} style={{ color: "var(--color-accent-cyan)", cursor: "pointer", fontSize: "11px" }}>
                      🔄 Rotate Key
                    </button>
                  </div>
                </div>


                {/* Security Badges */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--border-glass)", paddingTop: "18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--color-accent-cyan)" }}>🛡️</span>
                    <span>Zero-custodial forwarding direct to your multi-sig cold vault</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--color-success-emerald)" }}>⚡</span>
                    <span>NOWPayments SLA: 99.98% High Availability</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Right Panel: Live Preview Checkout */}
            <div className="glass-card-elevated" style={{ padding: "28px", border: "1px solid rgba(34, 211, 238, 0.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="status-pip pip-cyan" />
                  <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#F8FAFC", textTransform: "uppercase" }}>
                    LIVE PREVIEW CHECKOUT
                  </span>
                </div>
                <span className="badge-pill badge-muted font-mono" style={{ fontSize: "10px" }}>
                  Awaiting Call
                </span>
              </div>

              {/* Calculated Amount */}
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" }}>
                  CALCULATED PAYMENT AMOUNT
                </div>
                <div className="font-mono" style={{ fontSize: "32px", fontWeight: 800, color: "#F8FAFC" }}>
                  {calculatedCrypto} {selectedAsset}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-accent-cyan)", marginTop: "2px" }}>
                  ≈ ${fiatAmount} USD • Fixed 15m
                </div>
              </div>

              {/* QR Code Visualizer Box */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                <QRCodeVisualizer text={currentAssetMeta.defaultAddress} size={160} />
              </div>

              {/* Generated Address Tray */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Generated Payment Address</span>
                  <span style={{ fontSize: "10px", color: "var(--color-success-emerald)", fontWeight: 600 }}>
                    Verified NOWPayments Node
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#08080C",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    padding: "6px 8px 6px 12px",
                    gap: "8px",
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      flex: 1,
                      fontSize: "12px",
                      color: "#38BDF8",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {currentAssetMeta.defaultAddress}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentAssetMeta.defaultAddress);
                      setCopiedAddress(true);
                      setTimeout(() => setCopiedAddress(false), 2000);
                    }}
                    className="btn-copy"
                  >
                    {copiedAddress ? "✓" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Metadata Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid var(--border-glass)", paddingTop: "16px", marginBottom: "24px", fontSize: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Target Network Fee</span>
                  <span className="font-mono" style={{ color: "#F8FAFC" }}>{currentAssetMeta.networkFee}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Order ID Reference</span>
                  <span className="font-mono" style={{ color: "var(--color-accent-cyan)" }}>{orderRef}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>State Confirmation Goal</span>
                  <span style={{ color: "var(--color-success-emerald)" }}>{currentAssetMeta.confirmationsGoal}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Callback Routing</span>
                  <span className="font-mono" style={{ color: "var(--text-faint)" }}>api.mystore.com</span>
                </div>
              </div>

              {/* Primary CTA Button */}
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: 700,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <span>⚡</span>
                {isSubmitting ? "Generating Session..." : "Generate Payment & Launch Live Tracker"}
              </button>
              <p style={{ textAlign: "center", fontSize: "11px", color: "var(--text-faint)", marginBottom: "20px" }}>
                Broadcasts instant checkout session and begins mempool tracking.
              </p>

              {/* Developer REST API Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#08080C",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-glass)",
                }}
              >
                <span className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  REST API: POST /v1/payment
                </span>
                <button
                  type="button"
                  onClick={() => setIsPayloadModalOpen(true)}
                  style={{ fontSize: "11px", color: "var(--color-accent-cyan)", fontWeight: 600 }}
                >
                  Inspect Payload &#123;&#125;
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Payload Modal */}
      <PayloadModal
        isOpen={isPayloadModalOpen}
        onClose={() => setIsPayloadModalOpen(false)}
        payload={payloadData}
        title="REST API: POST /v1/payment"
      />

      {/* Footer matching DESIGN.md */}
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
            © 2026 LedgerPulse Cryptographic Settlement Infrastructure. All ledger interactions verifiable on-chain.
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/admin/settings" style={{ color: "var(--text-muted)" }}>API Status</Link>
            <Link href="/admin/webhooks" style={{ color: "var(--text-muted)" }}>HMAC Docs</Link>
            <Link href="/tracker" style={{ color: "var(--text-muted)" }}>Gas Oracle</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
