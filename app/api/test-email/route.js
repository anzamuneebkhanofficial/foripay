import { NextResponse } from "next/server";
import { sendPaymentCreatedEmail } from "@/lib/email";

export async function POST(request) {
  try {
    let toEmail;
    try {
      const body = await request.json();
      toEmail = body.to;
    } catch (_) {}

    const recipient = toEmail || process.env.SMTP_USER || "anzamuneebkhan13@gmail.com";

    const demoOrder = {
      id: "TEST-SMTP-VERIFY",
      amountCrypto: "0.04520 BTC",
      amountFiat: "4,250.00",
      asset: "BTC",
      network: "Bitcoin Mainnet",
      depositAddress: "bc1qar0srvv7xfkvy5l643lydnw9re59gtzzwf5md",
    };

    const result = await sendPaymentCreatedEmail({
      to: recipient,
      order: demoOrder,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `SMTP test email successfully delivered to ${recipient}`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "SMTP authentication or connection failed",
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST(new Request("http://localhost:3000/api/test-email", { method: "POST" }));
}
