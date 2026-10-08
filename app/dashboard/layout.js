import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import DashboardSidebar from "@/components/DashboardSidebar";

export const metadata = {
  title: "Merchant Dashboard — ForiPay",
  description: "Real-time incoming transactions, payment inspector, and webhook delivery stream.",
};

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-canvas)" }}>
      <DashboardSidebar user={user} />
      <div style={{ marginLeft: "260px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <main style={{ flex: 1, padding: "28px 32px", width: "100%", maxWidth: "1600px", boxSizing: "border-box" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
