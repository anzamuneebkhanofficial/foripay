import { getOrderById } from "@/lib/store";
import { isSimulationEnabled } from "@/lib/env";
import TrackerView from "@/components/TrackerView";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Payment Tracker #${id} — LedgerPulse`,
  };
}

export default async function ParametricTrackerPage({ params }) {
  const { id } = await params;
  const initialOrder = await getOrderById(id);
  const simulationEnabled = isSimulationEnabled();
  return <TrackerView initialOrder={initialOrder} simulationEnabled={simulationEnabled} />;
}
