import { getOrders } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import { isSimulationEnabled } from "@/lib/env";
import DashboardTrackerView from "@/components/DashboardTrackerView";

export const metadata = {
  title: "Live Tracker — ForiPay Merchant Dashboard",
  description: "Monitor live incoming crypto transactions and mempool status.",
};

export default async function DashboardTrackerPage() {
  const user = await getCurrentUser();
  const orders = await getOrders("All", "", user?.id);
  const initialOrder = orders.length > 0 ? orders[0] : null;
  const simulationEnabled = isSimulationEnabled();

  return <DashboardTrackerView initialOrder={initialOrder} simulationEnabled={simulationEnabled} />;
}
