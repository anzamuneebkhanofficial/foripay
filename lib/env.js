/**
 * Application Environment & Sandbox/Simulation Configuration Helper
 * Controls whether test simulations, fake advances, and sandbox simulator UI
 * are displayed or disabled across customer and merchant interfaces.
 */

export function isSimulationEnabled() {
  const flag = (
    process.env.NEXT_PUBLIC_SANDBOX_SIMULATION ||
    process.env.SandBox_FakeTest_Simulation ||
    ""
  ).toLowerCase().trim();

  // Explicitly disabled by user or admin in environment variables
  if (flag === "off" || flag === "false" || flag === "0" || flag === "disabled") {
    return false;
  }

  // Explicitly enabled
  if (flag === "on" || flag === "true" || flag === "1" || flag === "enabled") {
    return true;
  }

  // If in production or live gateway environment and not explicitly set, disable simulation
  if (process.env.NODE_ENV === "production" || process.env.NOWPAYMENTS_ENV === "production") {
    return false;
  }

  // Default in development mode is enabled
  return process.env.NODE_ENV !== "production";
}
