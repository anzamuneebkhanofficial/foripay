import { getOrders } from "@/lib/store";
import { isSimulationEnabled } from "@/lib/env";
import TrackerView from "@/components/TrackerView";

export const metadata = {
  title: "Live Payment Tracker — ForiPay",
  description: "Real-time asynchronous cryptocurrency payment tracker with SSE mempool telemetry.",
};

export default async function DefaultTrackerPage() {
  const latestOrders = await getOrders("All", "");
  const initialOrder = latestOrders.length > 0 ? latestOrders[0] : null;
  const simulationEnabled = isSimulationEnabled();
  return <TrackerView initialOrder={initialOrder} simulationEnabled={simulationEnabled} />;
}
