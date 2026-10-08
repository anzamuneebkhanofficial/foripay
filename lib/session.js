/**
 * Universal Web Crypto Session Token Signer & Verifier
 * Fully compatible with Next.js 16 Edge Proxy (proxy.js / middleware.js), Server Components & Node.js
 */

const SESSION_SECRET = (
  process.env.NOWPAYMENTS_IPN_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "paylock_session_secret_hmac_2026_xyz"
).trim();

function strToUint8(str) {
  return new TextEncoder().encode(str);
}

function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToStr(base64url) {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return decodeURIComponent(
    escape(atob(base64))
  );
}

export async function signSessionToken(payload) {
  const data = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const jsonStr = JSON.stringify(data);
  const body = btoa(unescape(encodeURIComponent(jsonStr)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const key = await crypto.subtle.importKey(
    "raw",
    strToUint8(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, strToUint8(body));
  const signature = bufferToBase64Url(signatureBuffer);
  return `${body}.${signature}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      strToUint8(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    let base64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const sigBinary = atob(base64);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, strToUint8(body));
    if (!isValid) return null;

    const jsonStr = base64UrlToStr(body);
    const data = JSON.parse(jsonStr);
    if (data.exp && Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}
