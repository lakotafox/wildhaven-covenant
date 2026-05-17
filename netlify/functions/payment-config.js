// Returns the Stripe publishable key (safe to expose to the browser) so the
// static checkout page can initialise Stripe.js. Mirrors FoxLock's use of
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.

exports.handler = async () => {
  const pk = process.env.STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({
      publishableKey: pk,
      configured: Boolean(pk && process.env.STRIPE_SECRET_KEY),
      mode: pk.startsWith("pk_live_") ? "live" : pk.startsWith("pk_test_") ? "test" : "unconfigured",
    }),
  };
};
