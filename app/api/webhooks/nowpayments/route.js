import { NextResponse } from "next/server";
import { verifyNowPaymentsIpnSignature } from "@/lib/nowpayments";
import { updateOrderByNowPayments, addWebhookLog, getOrderById } from "@/lib/store";
import { sendPaymentConfirmedEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const signature = request.headers.get("x-nowpayments-sig");
    const rawBody = await request.text();

    if (!rawBody) {
      return NextResponse.json({ success: false, message: "Empty body" }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    // Verify cryptographic signature if IPN Secret is configured
    const isValid = verifyNowPaymentsIpnSignature(body, signature);
    if (!isValid && process.env.NOWPAYMENTS_IPN_SECRET) {
      console.warn("[NOWPayments IPN] Invalid signature received:", signature);
      // In production, reject unauthenticated IPNs
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { success: false, message: "HMAC signature mismatch" },
          { status: 403 }
        );
      }
    }

    const orderId = body.order_id || body.payment_id;
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Missing order_id or payment_id" }, { status: 400 });
    }

    // Update order state in MongoDB
    const previousOrder = await getOrderById(orderId);
    const updatedOrder = await updateOrderByNowPayments(orderId, body);

    // Record webhook delivery log in MongoDB
    const eventName = `nowpayments.${body.payment_status || "update"}`;
    await addWebhookLog(orderId, eventName);

    // If transitioned to Confirmed/Finished, trigger customer confirmation email
    if (
      previousOrder?.status !== "Confirmed" &&
      (body.payment_status === "finished" || body.payment_status === "confirmed")
    ) {
      sendPaymentConfirmedEmail({
        to: updatedOrder?.customerEmail || process.env.SMTP_USER,
        order: updatedOrder || previousOrder,
      }).catch((err) => console.error("[IPN] Confirmation email error:", err.message));
    }

    return NextResponse.json({
      success: true,
      message: "IPN acknowledged and ledger updated",
      paymentId: body.payment_id,
      status: body.payment_status,
    });
  } catch (error) {
    console.error("[NOWPayments IPN] Processing error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "IPN handling failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "NOWPayments IPN Listener Active",
    version: "2.4",
    timestamp: new Date().toISOString(),
  });
}
