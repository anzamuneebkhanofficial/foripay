import { NextResponse } from "next/server";
import { getTelemetry } from "@/lib/store";

export async function GET() {
  try {
    const telemetry = await getTelemetry();
    return NextResponse.json({
      success: true,
      data: telemetry,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch telemetry" },
      { status: 500 }
    );
  }
}
