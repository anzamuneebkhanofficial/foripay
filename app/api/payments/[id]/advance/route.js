import { NextResponse } from "next/server";
import { advanceOrderStatus, addWebhookLog } from "@/lib/store";
import { sendPaymentFinalizedEmail } from "@/lib/email";
import { isSimulationEnabled } from "@/lib/env";

export async function POST(request, { params }) {
  try {
    if (!isSimulationEnabled()) {
      return NextResponse.json(
        { success: false, message: "Sandbox Simulation is disabled in live/production mode." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const updated = await advanceOrderStatus(id);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // If advanced to confirmed, log a webhook event and dispatch receipt email
    if (updated.status === "Confirmed") {
      await addWebhookLog(updated.id, "payment.finalized");
      sendPaymentFinalizedEmail({
        to: updated.customerEmail || process.env.SMTP_USER,
        order: updated,
      }).catch((err) => console.error("Settlement email error:", err.message));
    } else {
      await addWebhookLog(updated.id, "payment.confirming");
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to advance order" },
      { status: 500 }
    );
  }
}
