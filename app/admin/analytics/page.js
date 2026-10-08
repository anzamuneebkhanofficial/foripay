"use client";

import React, { useState, useEffect } from "react";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments?scope=all")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setOrders(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalVolume = orders.reduce((sum, o) => {
    const val = parseFloat((o.amountFiat || "").replace(/[^0-9.]/g, "")) || 0;
    return sum + val;
  }, 0);

  const confirmedOrders = orders.filter((o) => o.status === "Confirmed");
  const activeOrders = orders.filter((o) => o.status === "Waiting" || o.status === "Confirming");

  // Compute live asset distribution
  const assetMap = {
    BTC: { label: "Bitcoin Core (BTC)", color: "#F59E0B", volume: 0 },
    ETH: { label: "Ethereum Mainnet (ETH)", color: "#6366F1", volume: 0 },
    USDT: { label: "Tether USD (USDT)", color: "#10B981", volume: 0 },
    SOL: { label: "Solana SPL (SOL)", color: "#22D3EE", volume: 0 },
  };

  orders.forEach((o) => {
    const assetKey = (o.asset || "").toUpperCase();
    const val = parseFloat((o.amountFiat || "").replace(/[^0-9.]/g, "")) || 0;
    if (assetMap[assetKey]) {
      assetMap[assetKey].volume += val;
    } else {
      assetMap[assetKey] = { label: `${assetKey} Asset`, color: "#94A3B8", volume: val };
    }
  });

  const assetDistribution = Object.values(assetMap).map((item) => {
    const pct = totalVolume > 0 ? ((item.volume / totalVolume) * 100).toFixed(1) : "0.0";
    return {
      asset: item.label,
      volume: `$${item.volume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      percentage: `${pct}%`,
      color: item.color,
    };
  });

  const networkPerformance = [
    { network: "Solana Mainnet", avgLatency: "480ms", finalityType: "Instant (32 Slots)", uptime: "99.99%" },
    { network: "Ethereum Mainnet", avgLatency: "14.2s", finalityType: "Epoch (3 Blocks)", uptime: "100.0%" },
    { network: "Bitcoin Mainnet", avgLatency: "18.4 mins", finalityType: "Nakamoto PoW (3-Block Reorg Window)", uptime: "100.0%" },
    { network: "Polygon PoS", avgLatency: "2.4s", finalityType: "Checkpoint Finalized", uptime: "99.98%" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 className="text-headline-lg" style={{ color: "#F8FAFC", marginBottom: "4px" }}>
          Settlement Analytics
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Quantitative cryptographic throughput, asset liquidity distributions, and consensus latency metrics.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Total Aggregated Volume</div>
          <div className="font-mono" style={{ fontSize: "28px", fontWeight: 700, color: "#F8FAFC" }}>
            ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-success-emerald)", marginTop: "4px" }}>
            Calculated across {orders.length} real transaction{orders.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Confirmed Settlements</div>
          <div className="font-mono" style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-accent-cyan)" }}>
            {confirmedOrders.length} Confirmed
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            {activeOrders.length} Active in mempool
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Consensus Finality Rate</div>
          <div className="font-mono" style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-warning-amber)" }}>
            {orders.length > 0 ? `${((confirmedOrders.length / orders.length) * 100).toFixed(1)}%` : "100%"}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Real-time multi-chain throughput
          </div>
        </div>
      </div>

      {/* Grid: Asset Breakdown & Network Performance */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Asset Volume Breakdown */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 className="text-headline-md" style={{ fontSize: "17px", color: "#F8FAFC", marginBottom: "16px" }}>
            Volume by Protocol
          </h3>
          {orders.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
              No transactions recorded yet. Asset distribution will calculate automatically as payments are created.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {assetDistribution.map((item) => (
                <div key={item.asset}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                    <span style={{ fontWeight: 600, color: "#F8FAFC" }}>{item.asset}</span>
                    <span className="font-mono" style={{ color: item.color }}>{item.volume} ({item.percentage})</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: item.percentage, height: "100%", background: item.color, borderRadius: "3px" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Network Performance Table */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h3 className="text-headline-md" style={{ fontSize: "17px", color: "#F8FAFC", marginBottom: "16px" }}>
            Consensus Finality Benchmarks
          </h3>
          <table className="custom-table font-mono" style={{ fontSize: "12px" }}>
            <thead>
              <tr>
                <th>Network</th>
                <th>Avg Latency</th>
                <th>Finality Model</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              {networkPerformance.map((row) => (
                <tr key={row.network}>
                  <td style={{ fontWeight: 600, color: "#F8FAFC" }}>{row.network}</td>
                  <td style={{ color: "var(--color-accent-cyan)" }}>{row.avgLatency}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "11px" }}>{row.finalityType}</td>
                  <td style={{ color: "var(--color-success-emerald)" }}>{row.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
