import { NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/store";
import { calculateCryptoAmount, ASSET_RATES } from "@/lib/crypto-utils";
import { sendPaymentCreatedEmail } from "@/lib/email";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "All";
    const search = searchParams.get("search") || "";
    const requestedUserId = searchParams.get("userId");
    const scope = searchParams.get("scope");

    const currentUser = await getCurrentUser();
    // If scope is 'all', return all (e.g. for global tracker demo), otherwise scope to current merchant
    const targetUserId = scope === "all" ? null : (requestedUserId || currentUser?.id || null);

    const orders = await getOrders(filter, search, targetUserId);
    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id,
      amountFiat,
      fiatCurrency = "USD",
      asset = "BTC",
      customerEmail = "",
      customerRef = "",
      webhookEndpoint = "https://api.mystore.com/webhooks/crypto",
    } = body;

    if (!amountFiat || isNaN(parseFloat(amountFiat))) {
      return NextResponse.json(
        { success: false, message: "Valid fiat amount is required" },
        { status: 400 }
      );
    }

    const assetMeta = ASSET_RATES[asset] || ASSET_RATES.BTC;
    const cryptoAmount = calculateCryptoAmount(amountFiat, asset);
    const orderId = id || `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Real NOWPayments Gateway Integration
    let npPayment = null;
    let npInvoice = null;
    try {
      const { createNowPaymentsPayment, createNowPaymentsInvoice } = await import("@/lib/nowpayments");
      
      // 1. Generate White-Label Deposit Address (Native QR checkout)
      npPayment = await createNowPaymentsPayment({
        priceAmount: parseFloat(amountFiat),
        priceCurrency: fiatCurrency || "usd",
        payCurrency: asset || "btc",
        orderId,
        orderDescription: `Payment ${orderId} - ${customerRef || "Direct Checkout"}`,
        customerEmail,
        ipnCallbackUrl: webhookEndpoint || undefined,
      });

      // 2. Also generate hosted invoice checkout URL
      try {
        npInvoice = await createNowPaymentsInvoice({
          priceAmount: parseFloat(amountFiat),
          priceCurrency: fiatCurrency || "usd",
          orderId,
          orderDescription: `Invoice ${orderId} - ${customerRef || "Direct Checkout"}`,
          ipnCallbackUrl: webhookEndpoint || undefined,
        });
      } catch (invErr) {
        console.warn("[NOWPayments] Hosted invoice fallback:", invErr.message);
      }
    } catch (npErr) {
      console.warn("[NOWPayments] Gateway dispatch note:", npErr.message);
    }

    const currentUser = await getCurrentUser();
    const newOrder = await createOrder({
      id: orderId,
      userId: currentUser?.id || body.userId || "usr_merchant_01",
      customer: body.customer || "Direct Checkout Client",
      customerRef,
      customerEmail,
      amountFiat,
      fiatCurrency,
      amountCrypto: npPayment?.payAmount ? String(npPayment.payAmount) : cryptoAmount,
      asset: (npPayment?.payCurrency || asset).toUpperCase(),
      protocol: assetMeta.protocol,
      depositAddress: npPayment?.payAddress || assetMeta.defaultAddress,
      networkFee: assetMeta.networkFee,
      webhookEndpoint,
      nowpaymentsId: npPayment?.paymentId || npInvoice?.invoiceId || null,
      invoiceUrl: npInvoice?.invoiceUrl || null,
      payCurrency: npPayment?.payCurrency || asset,
      purchaseId: npPayment?.purchaseId || null,
    });

    // Send email notification via Nodemailer asynchronously
    sendPaymentCreatedEmail({
      to: customerEmail || process.env.SMTP_USER,
      order: newOrder,
    }).catch((err) => console.error("Email dispatch notice:", err.message));

    return NextResponse.json(
      { success: true, data: newOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/payments Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create payment" },
      { status: 500 }
    );
  }
}
