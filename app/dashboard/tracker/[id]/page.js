import { getOrderById } from "@/lib/store";
import { isSimulationEnabled } from "@/lib/env";
import DashboardTrackerView from "@/components/DashboardTrackerView";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Payment Tracker #${id} — ForiPay Dashboard`,
  };
}

export default async function DashboardTrackerByIdPage({ params }) {
  const { id } = await params;
  const initialOrder = await getOrderById(id);
  const simulationEnabled = isSimulationEnabled();

  return <DashboardTrackerView initialOrder={initialOrder} simulationEnabled={simulationEnabled} />;
}
