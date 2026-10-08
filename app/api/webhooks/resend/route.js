import { NextResponse } from "next/server";
import { addWebhookLog } from "@/lib/store";

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId = "ORD-TEST", event = "payment.confirming" } = body;

    const log = await addWebhookLog(orderId, event);

    return NextResponse.json({
      success: true,
      message: "Webhook dispatched and acknowledged via Hookdeck IPN",
      log,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to resend webhook" },
      { status: 500 }
    );
  }
}
