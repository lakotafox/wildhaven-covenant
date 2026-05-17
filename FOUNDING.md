# Wildhaven Covenant — making it real

This site is honest on purpose: Wildhaven Covenant is **in formation**. It is
**not** an incorporated nonprofit and **not** a 501(c)(3), so the site asks for
**founding contributions**, never "tax-deductible donations." Here is exactly
how to (a) switch payments on and (b) make contributions actually
tax-deductible.

---

## A. Turn on real payments (Stripe — same rails as FoxLock)

The Netlify Functions are built and deployed. They stay dormant and the site
honestly shows "pledge by email" **until you set your own Stripe keys**.

> ⚠️ Use a **dedicated Wildhaven Stripe account**, not FoxLock's. Routing
> contributions for one organization through another entity's Stripe account
> commingles funds and violates Stripe's agreement. If/when Wildhaven is its
> own legal entity, open Stripe under that entity.

Set the keys as Netlify environment variables (never commit them):

```sh
cd ~/wildhaven-covenant
netlify env:set STRIPE_SECRET_KEY        "sk_test_..."   # or sk_live_ when ready
netlify env:set STRIPE_PUBLISHABLE_KEY   "pk_test_..."   # or pk_live_
netlify deploy --prod --no-build
```

- **Test mode** (`sk_test_`/`pk_test_`): the site shows a TEST banner, no real
  money moves, card `4242 4242 4242 4242` works. Use this to verify the flow.
- **Live mode** (`sk_live_`/`pk_live_`): real charges. Only switch to live once
  the legal side below is squared away.

Verify after deploy:

```sh
curl -s https://wildhaven-covenant.netlify.app/api/payment-config
# {"publishableKey":"pk_...","configured":true,"mode":"test"}
```

## B. Make contributions tax-deductible (the legitimate routes)

The site already explains these to visitors. To actually deliver:

### Route A — Fiscal sponsorship (fastest, fully legal)
1. Find a 501(c)(3) **fiscal sponsor** whose mission covers land/wildlife
   conservation (many exist specifically for conservation projects).
2. Sign a fiscal-sponsorship agreement; Wildhaven operates as a sponsored
   project. Donors give to the sponsor *for* Wildhaven and get a deduction now.
3. Stripe should be the **sponsor's** account (or a restricted fund they
   control), per the agreement.

### Route B — Become your own 501(c)(3)
1. **Incorporate** as a nonprofit corporation in your state.
2. Adopt **bylaws** and seat an **independent board** (3+ unrelated people).
3. Get an **EIN** from the IRS.
4. File **IRS Form 1023** (not 1023-EZ — land trusts shouldn't use EZ) for
   501(c)(3) recognition.
5. **Register for charitable solicitation** in every state you fundraise in
   (most US states require this *before* asking the public for money).
6. Adopt the **stewardship-endowment** and **gift-acceptance** policies before
   accepting any land.
7. After the IRS **determination letter**, donations are deductible directly.

### When either route is done
Update the site copy: the warning banners and "founding contribution" wording
become "tax-deductible donation." **Do not change that wording one day early.**
Search the repo for `not tax-deductible` / `in formation` / `founding
contribution` and update intentionally.

---

## Files

| Path | Role |
|---|---|
| `netlify/functions/create-payment-intent.js` | Stripe PaymentIntent (mirrors FoxLock `api/checkout/route.ts`) |
| `netlify/functions/payment-config.js` | Serves publishable key + configured/mode to the static client |
| `assets/checkout.js` | Amount → details → Stripe Elements → confirm |
| `give.html` | The honest founding-contribution page |
| `success.html` | Post-payment status (reads PaymentIntent) |

No mock data anywhere. Numbers are zero because they are zero.
