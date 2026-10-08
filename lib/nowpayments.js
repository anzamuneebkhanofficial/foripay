import crypto from "crypto";

/**
 * NOWPayments Crypto Gateway Integration Module
 * Full Dual-Mode Support: Local Sandbox & Live Production Mainnet
 * Complies with official NOWPayments REST API v1 specification.
 */

export function getNowPaymentsConfig() {
  const apiKey = (process.env.NOWPAYMENTS_API_KEY || "").trim();
  const ipnSecret = (process.env.NOWPAYMENTS_IPN_SECRET || "").trim();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  // Priority: explicit NOWPAYMENTS_ENV -> fallback to 'production' if API key present
  const isSandbox = (process.env.NOWPAYMENTS_ENV || "").toLowerCase() === "sandbox";
  const baseUrl = isSandbox
    ? "https://api-sandbox.nowpayments.io/v1"
    : "https://api.nowpayments.io/v1";

  return {
    apiKey,
    ipnSecret,
    appUrl,
    isSandbox,
    env: isSandbox ? "sandbox" : "production",
    baseUrl,
  };
}

/**
 * Check NOWPayments API Connectivity & Health
 * GET /v1/status
 */
export async function checkNowPaymentsStatus() {
  const { baseUrl } = getNowPaymentsConfig();
  try {
    const res = await fetch(`${baseUrl}/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json();
    return { success: res.ok, status: res.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get Available Supported Currencies
 * GET /v1/currencies
 */
export async function getAvailableCurrencies() {
  const { apiKey, baseUrl } = getNowPaymentsConfig();
  try {
    const res = await fetch(`${baseUrl}/currencies`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 },
    });
    const data = await res.json();
    return { success: res.ok, currencies: data.currencies || [] };
  } catch (error) {
    return { success: false, currencies: ["btc", "eth", "usdttrc20", "trx", "doge", "ltc"], error: error.message };
  }
}

/**
 * Get Estimated Crypto Price for Fiat Amount
 * GET /v1/estimate?amount={amount}&currency_from={from}&currency_to={to}
 */
export async function getEstimatedPrice({ amount, currencyFrom = "usd", currencyTo = "btc" }) {
  const { apiKey, baseUrl } = getNowPaymentsConfig();
  try {
    const url = `${baseUrl}/estimate?amount=${amount}&currency_from=${currencyFrom.toLowerCase()}&currency_to=${currencyTo.toLowerCase()}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a White-Label Payment (Direct Crypto Deposit Address)
 * POST /v1/payment
 * Used for direct native QR checkout in PayLock Live Tracker
 */
export async function createNowPaymentsPayment({
  priceAmount,
  priceCurrency = "usd",
  payCurrency = "btc",
  orderId,
  orderDescription = "PayLock Payment Settlement",
  ipnCallbackUrl = null,
  customerEmail = null,
}) {
  const { apiKey, baseUrl, appUrl, isSandbox } = getNowPaymentsConfig();

  if (!apiKey) {
    throw new Error("NOWPAYMENTS_API_KEY is not configured in environment variables.");
  }

  // Fallback to our webhook endpoint if no custom IPN URL provided
  const callbackUrl = ipnCallbackUrl || `${appUrl}/api/webhooks/nowpayments`;

  // Normalize currency tickers (NOWPayments expects 'usdttrc20' or 'usdterc20' instead of generic 'usdt')
  let normalizedPayCurrency = payCurrency.toLowerCase().trim();
  if (normalizedPayCurrency === "usdt") {
    normalizedPayCurrency = "usdttrc20";
  }

  const payload = {
    price_amount: parseFloat(priceAmount),
    price_currency: priceCurrency.toLowerCase(),
    pay_currency: normalizedPayCurrency,
    order_id: orderId,
    order_description: orderDescription,
    ipn_callback_url: callbackUrl,
    customer_email: customerEmail || undefined,
    is_fixed_rate: false,
    is_fee_paid_by_user: false,
  };

  let res = await fetch(`${baseUrl}/payment`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let data = await res.json();

  if (!res.ok && isSandbox && res.status === 403) {
    res = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    data = await res.json();
  }

  if (!res.ok) {
    const errMsg = data.message || data.error || JSON.stringify(data);
    throw new Error(`NOWPayments Payment Creation Failed (${res.status}): ${errMsg}`);
  }

  return {
    paymentId: String(data.payment_id),
    paymentStatus: data.payment_status || "waiting",
    payAddress: data.pay_address,
    priceAmount: data.price_amount,
    priceCurrency: data.price_currency,
    payAmount: data.pay_amount,
    payCurrency: data.pay_currency,
    orderId: data.order_id,
    orderDescription: data.order_description,
    purchaseId: String(data.purchase_id || ""),
    network: data.network || payCurrency,
    validUntil: data.valid_until,
    createdAt: data.created_at,
    raw: data,
  };
}

/**
 * Create a Hosted Payment Invoice (External NOWPayments Checkout Page)
 * POST /v1/invoice
 */
export async function createNowPaymentsInvoice({
  priceAmount,
  priceCurrency = "usd",
  orderId,
  orderDescription = "PayLock Invoice Settlement",
  ipnCallbackUrl = null,
  successUrl = null,
  cancelUrl = null,
}) {
  const { apiKey, baseUrl, appUrl, isSandbox } = getNowPaymentsConfig();

  if (!apiKey) {
    throw new Error("NOWPAYMENTS_API_KEY is not configured in environment variables.");
  }

  const callbackUrl = ipnCallbackUrl || `${appUrl}/api/webhooks/nowpayments`;
  const returnSuccessUrl = successUrl || `${appUrl}/receipt?orderId=${orderId}`;
  const returnCancelUrl = cancelUrl || `${appUrl}/dashboard/tracker?orderId=${orderId}`;

  const payload = {
    price_amount: parseFloat(priceAmount),
    price_currency: priceCurrency.toLowerCase(),
    order_id: orderId,
    order_description: orderDescription,
    ipn_callback_url: callbackUrl,
    success_url: returnSuccessUrl,
    cancel_url: returnCancelUrl,
    is_fixed_rate: false,
    is_fee_paid_by_user: false,
  };

  let res = await fetch(`${baseUrl}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let data = await res.json();

  if (!res.ok && isSandbox && res.status === 403) {
    res = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    data = await res.json();
  }

  if (!res.ok) {
    const errMsg = data.message || data.error || JSON.stringify(data);
    throw new Error(`NOWPayments Invoice Creation Failed (${res.status}): ${errMsg}`);
  }

  return {
    invoiceId: String(data.id),
    orderId: data.order_id,
    invoiceUrl: data.invoice_url,
    priceAmount: data.price_amount,
    priceCurrency: data.price_currency,
    raw: data,
  };
}

/**
 * Get Payment Status (Polling Method for Localhost & Real-Time Sync)
 * GET /v1/payment/{payment_id}
 */
export async function getNowPaymentsPaymentStatus(paymentId) {
  const { apiKey, baseUrl, isSandbox } = getNowPaymentsConfig();

  if (!apiKey) {
    throw new Error("NOWPAYMENTS_API_KEY is not configured.");
  }

  let res = await fetch(`${baseUrl}/payment/${paymentId}`, {
    method: "GET",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  let data = await res.json();

  if (!res.ok && isSandbox && res.status === 403) {
    res = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    data = await res.json();
  }

  if (!res.ok) {
    const errMsg = data.message || data.error || JSON.stringify(data);
    throw new Error(`NOWPayments Status Query Failed (${res.status}): ${errMsg}`);
  }

  return {
    paymentId: String(data.payment_id),
    paymentStatus: data.payment_status, // 'waiting' | 'confirming' | 'confirmed' | 'sending' | 'finished' | 'failed' | 'refunded' | 'expired'
    payAddress: data.pay_address,
    payAmount: data.pay_amount,
    actuallyPaid: data.actually_paid || 0,
    payCurrency: data.pay_currency,
    outcomeAmount: data.outcome_amount,
    outcomeCurrency: data.outcome_currency,
    orderId: data.order_id,
    purchaseId: data.purchase_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    raw: data,
  };
}

/**
 * Sort Object Keys Alphabetically (Required by NOWPayments IPN Specification)
 */
function sortObject(obj) {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObject);
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = typeof obj[key] === "object" && obj[key] !== null ? sortObject(obj[key]) : obj[key];
      return result;
    }, {});
}

/**
 * Cryptographically Verify Inbound IPN Signature
 * Uses HMAC-SHA512 on sorted JSON payload according to NOWPayments official standard
 */
export function verifyNowPaymentsIpnSignature(payload, receivedSignature, customSecret = null) {
  const { ipnSecret } = getNowPaymentsConfig();
  const secret = (customSecret || ipnSecret || "").trim();

  if (!secret) {
    console.warn("[NOWPayments IPN] Missing IPN secret key for verification.");
    return false;
  }

  if (!receivedSignature) {
    return false;
  }

  try {
    const sorted = sortObject(payload);
    const sortedJson = JSON.stringify(sorted);

    const hmac = crypto.createHmac("sha512", secret);
    hmac.update(sortedJson);
    const calculatedSignature = hmac.digest("hex");

    return calculatedSignature.toLowerCase() === receivedSignature.trim().toLowerCase();
  } catch (error) {
    console.error("[NOWPayments IPN] Verification error:", error);
    return false;
  }
}
