/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SandBox_FakeTest_Simulation: process.env.SandBox_FakeTest_Simulation || process.env.NEXT_PUBLIC_SANDBOX_SIMULATION || "on",
    NEXT_PUBLIC_SANDBOX_SIMULATION: process.env.SandBox_FakeTest_Simulation || process.env.NEXT_PUBLIC_SANDBOX_SIMULATION || "on",
  },
};

export default nextConfig;
