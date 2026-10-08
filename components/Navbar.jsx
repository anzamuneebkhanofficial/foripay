"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ConnectNodeModal from "./ConnectNodeModal";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
    } catch {
      router.push("/");
    }
  };

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "Live Demo", href: "/#simulator" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Security & Vault", href: "/#features" },
  ];

  const isActive = (href) => {
    return pathname === href;
  };

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: "64px",
          borderBottom: "1px solid var(--border-glass)",
          backgroundColor: "rgba(10, 10, 15, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          zIndex: 1000,
        }}
      >
        <div
          className="container-constrained"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left: Brand & Live Mempool Feed Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#22D3EE",
                  boxShadow: "0 0 10px #22D3EE",
                }}
              />
              <span style={{ fontSize: "19px", fontWeight: "800", letterSpacing: "-0.01em", color: "#F8FAFC" }}>
                ForiPay <span style={{ fontSize: "12px", color: "var(--color-accent-cyan)", fontWeight: 500 }}>فوری پے</span>
              </span>
            </Link>

            <div
              className="badge-pill badge-cyan font-mono"
              style={{ fontSize: "11px", padding: "3px 10px", letterSpacing: "0.02em" }}
            >
              <span className="status-pip pip-cyan" style={{ width: "6px", height: "6px" }} />
              Fast Mempool Active
            </div>
          </div>

          {/* Center: Navigation Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "24px", height: "100%" }}>
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                    fontSize: "14px",
                    fontWeight: active ? "600" : "500",
                    color: active ? "#F8FAFC" : "var(--text-muted)",
                    position: "relative",
                    transition: "color 0.15s ease",
                  }}
                >
                  {link.label}
                  {active && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "2px",
                        backgroundColor: "#22D3EE",
                        boxShadow: "0 0 8px #22D3EE",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: User Profile or Sign In / Sign Up */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {!loadingUser && user ? (
              // Logged In: Show Merchant Pill & Dashboard Quick Link + Logout
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    background: user.role === "admin" ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.05)",
                    border: user.role === "admin" ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid var(--border-glass)",
                    borderRadius: "20px",
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: user.role === "admin" ? "#EF4444" : "#10B981",
                      boxShadow: user.role === "admin" ? "0 0 6px #EF4444" : "0 0 6px #10B981",
                    }}
                  />
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#F8FAFC" }}>
                    {user.role === "admin" ? "Admin" : (user.name || "Merchant")}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: "6px 8px",
                    borderRadius: "6px",
                  }}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              // Logged Out: Show Sign In & Start Free CTAs
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link
                  href="/login"
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-secondary)",
                    padding: "7px 14px",
                    borderRadius: "6px",
                    textDecoration: "none",
                  }}
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="btn-primary"
                  style={{
                    fontSize: "13px",
                    padding: "7px 16px",
                    fontWeight: "600",
                  }}
                >
                  Start Free →
                </Link>
              </div>
            )}

            {/* Connect Node button */}
            <button
              onClick={() => setIsNodeModalOpen(true)}
              className="btn-cyan-outline font-mono"
              style={{ fontSize: "11px", padding: "5px 10px" }}
              title="Inspect RPC Node Connection"
            >
              Node
            </button>
          </div>
        </div>
      </header>

      <ConnectNodeModal
        isOpen={isNodeModalOpen}
        onClose={() => setIsNodeModalOpen(false)}
      />
    </>
  );
}
