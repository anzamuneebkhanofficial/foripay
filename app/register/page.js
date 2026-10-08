"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "@/lib/validations";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: "",
      businessName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || "Registration failed.");
      }

      toast.success("Account registered! Please check your email to verify your account.");
      router.push("/login");
    } catch (err) {
      toast.error(err.message || "Could not register account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-canvas)",
        padding: "32px 24px",
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#22D3EE",
              boxShadow: "0 0 12px #22D3EE",
            }}
          />
          <span style={{ fontSize: "22px", fontWeight: "800", color: "#F8FAFC", letterSpacing: "-0.02em" }}>
            ForiPay <span style={{ fontSize: "14px", color: "var(--color-accent-cyan)" }}>فوری پے</span>
          </span>
        </Link>
        <h1 className="text-headline-lg" style={{ color: "#F8FAFC", marginBottom: "6px" }}>
          Create Your Merchant Account
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Accept crypto with instant 3-second mempool detection and 0% custodial holding.
        </p>
      </div>

      {/* Registration Card */}
      <div
        className="glass-card-elevated"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "36px",
          border: "1px solid var(--border-glass)",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "8px",
                }}
              >
                Your Name
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="John Doe"
                className="input-field"
                style={{ fontSize: "14px", borderColor: errors.name ? "#EF4444" : undefined }}
              />
              {errors.name && (
                <span style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", display: "block" }}>
                  {errors.name.message}
                </span>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  marginBottom: "8px",
                }}
              >
                Business / Store
              </label>
              <input
                type="text"
                {...register("businessName")}
                placeholder="Acme Store"
                className="input-field"
                style={{ fontSize: "14px", borderColor: errors.businessName ? "#EF4444" : undefined }}
              />
              {errors.businessName && (
                <span style={{ fontSize: "11px", color: "#EF4444", marginTop: "4px", display: "block" }}>
                  {errors.businessName.message}
                </span>
              )}
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "8px",
              }}
            >
              Business Email Address
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="billing@yourstore.com"
              className="input-field"
              style={{ fontSize: "14px", borderColor: errors.email ? "#EF4444" : undefined }}
            />
            {errors.email && (
              <span style={{ fontSize: "12px", color: "#EF4444", marginTop: "4px", display: "block" }}>
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "8px",
              }}
            >
              Password (min 6 characters)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••••••"
                className="input-field"
                style={{ fontSize: "14px", paddingRight: "42px", borderColor: errors.password ? "#EF4444" : undefined }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span style={{ fontSize: "12px", color: "#EF4444", marginTop: "4px", display: "block" }}>
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Value Prop Badges */}
          <div
            style={{
              padding: "12px 14px",
              background: "rgba(34, 211, 238, 0.05)",
              border: "1px solid rgba(34, 211, 238, 0.15)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--text-secondary)",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#22D3EE" }}>✓</span> Instant Gmail onboarding notification with credentials
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#22D3EE" }}>✓</span> Dedicated merchant invoice workspace & cold vault payouts
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              padding: "13px",
              fontSize: "14px",
              fontWeight: "600",
              width: "100%",
              justifyContent: "center",
              marginTop: "4px",
            }}
          >
            {loading ? "Creating Account..." : "Create Merchant Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "24px", marginBottom: 0 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#22D3EE", fontWeight: "600" }}>
            Sign in
          </Link>
        </p>
      </div>

      <Link
        href="/"
        style={{
          marginTop: "24px",
          fontSize: "13px",
          color: "var(--text-muted)",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        ← Back to ForiPay Home
      </Link>
    </div>
  );
}
