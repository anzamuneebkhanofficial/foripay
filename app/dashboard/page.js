import AdminConsoleView from "@/components/AdminConsoleView";
import { isSimulationEnabled } from "@/lib/env";

export const metadata = {
  title: "Merchant Dashboard — ForiPay",
  description: "Real-time incoming transactions, payment inspector, and webhook delivery stream.",
};

export default async function DashboardPage() {
  const simulationEnabled = isSimulationEnabled();
  return <AdminConsoleView simulationEnabled={simulationEnabled} />;
}
