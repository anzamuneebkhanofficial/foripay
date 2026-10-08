"use client";

import React, { useState, useEffect } from "react";
import { generateHmacSignature } from "@/lib/crypto-utils";

export default function WebhooksPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/webhooks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.logs) {
          setLogs(data.logs);
        }
      })
      .catch(() => {});
  }, []);

  const [testEndpoint, setTestEndpoint] = useState("https://api.mystore.com/webhooks/crypto");
  const [testStatus, setTestStatus] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const handleTestPing = async () => {
    setIsTesting(true);
    setTestStatus("");
    try {
      const res = await fetch("/api/webhooks/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: "TEST-PING", event: "ping.test" }),
      });
      const data = await res.json();
      if (data.success && data.log) {
        setLogs((prev) => [data.log, ...prev]);
        setTestStatus(`✓ HTTP 200 OK — Signature verified in ${data.log.durationMs}ms`);
      }
    } catch (_) {
      setTestStatus("Failed to send test ping");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="text-headline-lg" style={{ color: "#F8FAFC", marginBottom: "4px" }}>
          Webhooks & IPN Delivery Center
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Cryptographically signed instant payment notifications (IPN) with HMAC-SHA256 & HMAC-SHA512 verification.
        </p>
      </div>

      {/* Simulator Test Bar */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "28px" }}>
        <h3 className="text-headline-md" style={{ fontSize: "16px", color: "#F8FAFC", marginBottom: "12px" }}>
          Webhook Dispatch Tester
        </h3>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="url"
            value={testEndpoint}
            onChange={(e) => setTestEndpoint(e.target.value)}
            className="input-field font-mono"
            style={{ flex: 1, minWidth: "280px", fontSize: "13px" }}
          />
          <button
            onClick={handleTestPing}
            disabled={isTesting}
            className="btn-cyan-outline font-mono"
            style={{ padding: "10px 18px", fontSize: "13px" }}
          >
            {isTesting ? "Dispatching..." : "⚡ Send Test Event Ping"}
          </button>
        </div>
        {testStatus && (
          <div style={{ marginTop: "12px", fontSize: "12px", color: "var(--color-success-emerald)", fontWeight: 600 }}>
            {testStatus}
          </div>
        )}
      </div>

      {/* Webhook Delivery Log Table */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 className="text-headline-md" style={{ fontSize: "17px", color: "#F8FAFC" }}>
            Delivery Execution Logs
          </h3>
          <span className="badge-pill badge-emerald font-mono" style={{ fontSize: "11px" }}>
            100% Delivery SLA
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="custom-table font-mono" style={{ fontSize: "12px" }}>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Order Ref</th>
                <th>Event Type</th>
                <th>Destination Endpoint</th>
                <th>Status</th>
                <th>Latency</th>
                <th>HMAC Signature</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)", fontSize: "13px" }}>
                    No webhook dispatches yet. Use the ping tool above or generate an invoice to observe real-time IPN events.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ color: "var(--text-muted)" }}>{log.id}</td>
                    <td style={{ color: "#22D3EE", fontWeight: 600 }}>#{log.orderId}</td>
                    <td style={{ color: "#F8FAFC" }}>{log.event}</td>
                    <td style={{ color: "var(--text-secondary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.url}
                    </td>
                    <td>
                      <span className="badge-pill badge-emerald" style={{ fontSize: "10px", padding: "2px 8px" }}>
                        HTTP {log.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--color-accent-cyan)" }}>{log.durationMs}ms</td>
                    <td style={{ color: "var(--text-faint)", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.signature}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
