import { NextResponse } from "next/server";
import { getWebhookLogs } from "@/lib/store";

export async function GET() {
  try {
    const logs = await getWebhookLogs();
    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}
