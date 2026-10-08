import { NextResponse } from "next/server";
import { getOrderById, updateOrderByNowPayments, addWebhookLog } from "@/lib/store";
import { getNowPaymentsPaymentStatus } from "@/lib/nowpayments";
import { sendPaymentConfirmedEmail } from "@/lib/email";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: "Missing order ID" }, { status: 400 });
    }

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // If order has no NOWPayments ID, return current stored state
    if (!order.nowpaymentsId) {
      return NextResponse.json({
        success: true,
        synced: false,
        message: "Order has no linked NOWPayments ID (simulated)",
        order,
      });
    }

    // Query NOWPayments API for real blockchain status
    try {
      const npStatus = await getNowPaymentsPaymentStatus(order.nowpaymentsId);
      const previousStatus = order.status;
      const updatedOrder = await updateOrderByNowPayments(order.id, npStatus);

      // If transition to Confirmed just occurred, send receipt email & log IPN event
      if (previousStatus !== "Confirmed" && updatedOrder?.status === "Confirmed") {
        await addWebhookLog(order.id, "payment.finished");
        sendPaymentConfirmedEmail({
          to: order.customerEmail || process.env.SMTP_USER,
          order: updatedOrder,
        }).catch((err) => console.error("[Sync] Email dispatch note:", err.message));
      }

      return NextResponse.json({
        success: true,
        synced: true,
        npStatus: npStatus.paymentStatus,
        order: updatedOrder,
      });
    } catch (npError) {
      console.warn(`[Sync] Failed to poll NOWPayments for order ${id}:`, npError.message);
      return NextResponse.json({
        success: true,
        synced: false,
        warning: npError.message,
        order,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Sync failed" },
      { status: 500 }
    );
  }
}
