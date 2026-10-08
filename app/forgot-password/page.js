"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forgotPasswordSchema } from "@/lib/validations";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || "Failed to process request.");
      }

      setDispatched(true);
      toast.success("Recovery instructions dispatched via Gmail SMTP.");
    } catch (err) {
      toast.error(err.message || "Error submitting request");
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
        padding: "24px",
      }}
    >
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
          <span style={{ fontSize: "22px", fontWeight: "700", color: "#F8FAFC", letterSpacing: "-0.02em" }}>
            LedgerPulse
          </span>
        </Link>
        <h1 className="text-headline-lg" style={{ color: "#F8FAFC", marginBottom: "6px" }}>
          Reset Account Password
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Enter your registered merchant email to receive a recovery link.
        </p>
      </div>

      <div
        className="glass-card-elevated"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "36px",
          border: "1px solid var(--border-glass)",
        }}
      >
        {dispatched ? (
          <div>
            <div
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#6EE7B7",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "14px",
                lineHeight: "1.5",
                marginBottom: "24px",
              }}
            >
              ✓ If an account matches this email, a password recovery link has been dispatched via Gmail SMTP.
            </div>
            <Link
              href="/login"
              className="btn-cyan-outline"
              style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                Registered Email Address
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
              }}
            >
              {loading ? "Sending Recovery Link..." : "Send Reset Link via Email →"}
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "24px", marginBottom: 0 }}>
          Remember your password?{" "}
          <Link href="/login" style={{ color: "#22D3EE", fontWeight: "600" }}>
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
