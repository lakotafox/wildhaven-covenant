# Wildhaven Covenant

A stewardship land trust & wildlife sanctuary **in formation** — *we will hold
wild land in trust, forever.*

Windows 98–themed static site (style reused from the Lucky You / Really Cool
Hair retro site) **+ real Stripe rails** via Netlify Functions for **founding
contributions**.

> **Honest status:** Wildhaven Covenant is a concept in formation. It is **not**
> an incorporated nonprofit and **not** a 501(c)(3). The site asks for
> *founding contributions* (to form the org), never *tax-deductible donations*.
> There is **no mock data** anywhere — numbers are zero because they are zero.
> See **FOUNDING.md** for how to switch payments on and make it real.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Landing — honest mission, status, the plan |
| `covenant.html` | The Stewardship Covenant (intended identity) |
| `preserves.html` | "The Plan" — the founding roadmap, no invented preserves |
| `give.html` | Founding-contribution checkout (Stripe Elements) |
| `success.html` | Post-payment status page |
| `404.html` | Themed Win98 error dialog |
| `assets/win98.css` / `win98.js` | Shared retro chrome |
| `assets/checkout.js` | Stripe checkout flow |
| `netlify/functions/create-payment-intent.js` | Server PaymentIntent (FoxLock pattern) |
| `netlify/functions/payment-config.js` | Publishable key / mode for the client |

## Local

```sh
bun install
netlify dev          # serves site + functions
# or static only:
python3 -m http.server 8080
```

## Deploy

```sh
bun install                          # so esbuild can bundle `stripe`
netlify deploy --prod --no-build
```

Payments stay dormant (site honestly shows "pledge by email") until
`STRIPE_SECRET_KEY` + `STRIPE_PUBLISHABLE_KEY` are set as Netlify env vars —
see **FOUNDING.md**. Use a **dedicated Wildhaven Stripe account**, not FoxLock's.

GitHub: `lakotafox/wildhaven-covenant` · Netlify: `wildhaven-covenant` (FOXBUILT).
Not legal/tax advice.
