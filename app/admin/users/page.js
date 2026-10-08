"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch {
      toast.error("Failed to load merchants list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Are you sure you want to remove merchant "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(`Merchant "${name}" removed`);
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        toast.error(data.message || "Could not delete user");
      }
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.businessName && u.businessName.toLowerCase().includes(q))
    );
  });

  const verifiedCount = users.filter((u) => u.emailVerified).length;
  const totalInvoices = users.reduce((sum, u) => sum + (u.totalInvoices || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 className="text-headline-lg" style={{ color: "#F8FAFC", marginBottom: "6px" }}>
          Registered Merchants & Users
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Master directory of all onboarded store owners, payment accounts, and verification statuses.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
            Total Registered Merchants
          </div>
          <div className="font-mono" style={{ fontSize: "28px", fontWeight: 700, color: "#F8FAFC" }}>
            {users.length}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-accent-cyan)", marginTop: "4px" }}>
            Real accounts in database
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
            Verified Store Owners
          </div>
          <div className="font-mono" style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-success-emerald)" }}>
            {verifiedCount}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            {users.length - verifiedCount} Pending Email Verification
          </div>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
            Merchant Invoices Generated
          </div>
          <div className="font-mono" style={{ fontSize: "28px", fontWeight: 700, color: "#38BDF8" }}>
            {totalInvoices}
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            Across all store accounts
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card" style={{ padding: "24px" }}>
        {/* Search Bar */}
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "420px" }}>
            <input
              type="text"
              placeholder="Search by merchant name, business, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ fontSize: "13px", padding: "10px 14px" }}
            />
          </div>

          <div className="badge-pill badge-muted font-mono" style={{ fontSize: "12px" }}>
            Showing {filteredUsers.length} of {users.length} Merchants
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="custom-table" style={{ fontSize: "13px" }}>
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Business Name</th>
                <th>Email Address</th>
                <th>Verification</th>
                <th>Invoices Created</th>
                <th>Joined Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: "var(--text-muted)" }}>
                    Loading merchant accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    {searchQuery ? "No merchants match your search." : "No merchants registered yet."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            backgroundColor: "rgba(34, 211, 238, 0.15)",
                            border: "1px solid rgba(34, 211, 238, 0.3)",
                            color: "#22D3EE",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          {u.name ? u.name[0].toUpperCase() : "M"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#F8FAFC" }}>{u.name}</div>
                          <div className="font-mono" style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            ID: {u.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ color: "#F8FAFC", fontWeight: 500 }}>
                      {u.businessName || "Store"}
                    </td>

                    <td className="font-mono" style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                      {u.email}
                    </td>

                    <td>
                      <span
                        className={`badge-pill ${u.emailVerified ? "badge-emerald" : "badge-amber"}`}
                        style={{ fontSize: "10px", padding: "2px 8px" }}
                      >
                        <span className={`status-pip ${u.emailVerified ? "pip-emerald" : "pip-amber"}`} />
                        {u.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>

                    <td className="font-mono" style={{ fontWeight: 600, color: "#22D3EE" }}>
                      {u.totalInvoices || 0} ({u.totalVolumeFiat || "$0.00"})
                    </td>

                    <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recent"}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="btn-secondary"
                        style={{
                          padding: "4px 10px",
                          fontSize: "11px",
                          color: "#EF4444",
                          borderColor: "rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        Remove
                      </button>
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
