import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export const metadata = {
  title: "System Admin Observatory — ForiPay",
  description: "Global cross-merchant observatory, node telemetry, and system-wide IPN delivery logs.",
};

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-canvas)" }}>
      <AdminSidebar user={user} />
      <div style={{ marginLeft: "260px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <main style={{ flex: 1, padding: "28px 32px", width: "100%", maxWidth: "1600px", boxSizing: "border-box" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
