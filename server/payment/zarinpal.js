// ZarinPal IPG v4 integration. ZarinPal only settles in Iranian Rial, while
// the storefront prices everything in EUR — so we convert at the moment of
// payment only (EUR_TO_IRR_RATE env var), keeping the catalog/order records
// in EUR throughout. Defaults to ZarinPal's public sandbox (works with zero
// real merchant setup) until ZARINPAL_MERCHANT_ID is set.

const SANDBOX = process.env.ZARINPAL_SANDBOX !== "false";
const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || "00000000-0000-0000-0000-000000000000";
const API_BASE = SANDBOX ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
const START_PAY_BASE = SANDBOX ? "https://sandbox.zarinpal.com" : "https://www.zarinpal.com";
const EUR_TO_IRR_RATE = Number(process.env.EUR_TO_IRR_RATE) || 700000;

if (!process.env.ZARINPAL_MERCHANT_ID) {
  console.warn(
    "[zarinpal] ZARINPAL_MERCHANT_ID not set — running against the ZarinPal sandbox. Set your real merchant ID (and EUR_TO_IRR_RATE) before accepting real payments."
  );
}

export function eurToRial(eurAmount) {
  return Math.max(1000, Math.round(Number(eurAmount) * EUR_TO_IRR_RATE));
}

export async function requestPayment({ amountEur, description, callbackUrl, email, mobile }) {
  const amountRial = eurToRial(amountEur);
  const res = await fetch(`${API_BASE}/pg/v4/payment/request.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchant_id: MERCHANT_ID,
      amount: amountRial,
      description,
      callback_url: callbackUrl,
      metadata: { email: email || undefined, mobile: mobile || undefined },
    }),
  });
  const data = await res.json();
  if (data?.data?.code !== 100) {
    throw new Error(data?.errors?.message || `ZarinPal payment request failed (${JSON.stringify(data?.errors)}).`);
  }
  const authority = data.data.authority;
  return { authority, payUrl: `${START_PAY_BASE}/pg/StartPay/${authority}`, amountRial };
}

export async function verifyPayment({ authority, amountRial }) {
  const res = await fetch(`${API_BASE}/pg/v4/payment/verify.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchant_id: MERCHANT_ID, amount: amountRial, authority }),
  });
  const data = await res.json();
  const code = data?.data?.code;
  if (code === 100 || code === 101) {
    return { ok: true, refId: data.data.ref_id };
  }
  return { ok: false, code, message: data?.errors?.message };
}
