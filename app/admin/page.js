import AdminConsoleView from "@/components/AdminConsoleView";
import { isSimulationEnabled } from "@/lib/env";

export const metadata = {
  title: "System Admin Observatory — ForiPay",
  description: "Global cross-merchant observatory, node telemetry, and system-wide IPN delivery logs.",
};

export default async function AdminPage() {
  const simulationEnabled = isSimulationEnabled();
  return <AdminConsoleView scope="all" simulationEnabled={simulationEnabled} />;
}
