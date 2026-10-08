"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your email address...");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setStatus("success");
          setMessage("Email verified successfully! You can now log in.");
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify email.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An unexpected error occurred during verification.");
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "radial-gradient(ellipse at top, #11111a, var(--bg-canvas))",
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#22D3EE",
                boxShadow: "0 0 10px #22D3EE",
              }}
            />
            <span style={{ fontSize: "20px", fontWeight: "700", color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              ForiPay
            </span>
          </Link>
        </div>

        <h1 className="text-headline-sm" style={{ marginBottom: "16px", color: "#F8FAFC" }}>
          Email Verification
        </h1>

        <div
          style={{
            padding: "16px",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: "24px",
            color: status === "error" ? "var(--color-warning-amber)" : status === "success" ? "var(--color-success-emerald)" : "var(--text-muted)",
          }}
        >
          {message}
        </div>

        {status !== "verifying" && (
          <Link
            href="/login"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Go to Login
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
