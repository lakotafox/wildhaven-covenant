// Wildhaven Covenant — founding-contribution PaymentIntent.
// Mirrors the FoxLock Stripe pattern (src/app/api/checkout/route.ts):
// server-side PaymentIntent, secret key from env, returns clientSecret.
//
// IMPORTANT: this charges a FOUNDING CONTRIBUTION toward forming the
// organization. It is NOT a tax-deductible charitable donation — Wildhaven
// Covenant is not yet an incorporated 501(c)(3). Copy on the site says so.

const Stripe = require("stripe");

const MIN_CENTS = 100;        // $1.00 floor
const MAX_CENTS = 5000000;    // $50,000 ceiling (sanity / fraud guard)

exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error:
          "Payments not configured yet. The site owner must set STRIPE_SECRET_KEY " +
          "(a dedicated Wildhaven Stripe account) in Netlify environment variables.",
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  // amount arrives in whole dollars from the UI; convert to cents.
  const dollars = Number(payload.amount);
  if (!Number.isFinite(dollars) || dollars <= 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Enter a contribution amount." }) };
  }
  const amount = Math.round(dollars * 100);
  if (amount < MIN_CENTS) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Minimum contribution is $1." }) };
  }
  if (amount > MAX_CENTS) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "For contributions over $50,000, email land@wildhavencovenant.org." }) };
  }

  const email =
    typeof payload.email === "string" && payload.email.includes("@")
      ? payload.email.slice(0, 200)
      : undefined;
  const name =
    typeof payload.name === "string" ? payload.name.slice(0, 120) : undefined;

  const stripe = new Stripe(secret, { apiVersion: "2026-01-28.clover" });

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      description: "Wildhaven Covenant — founding contribution (NOT tax-deductible; org in formation)",
      receipt_email: email,
      metadata: {
        product: "Wildhaven Covenant founding contribution",
        contributor_name: name || "",
        tax_deductible: "false",
        org_status: "in_formation_not_501c3",
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (err) {
    const message = err && err.message ? err.message : "Payment setup failed";
    return { statusCode: 502, headers, body: JSON.stringify({ error: message }) };
  }
};
