# Wildhaven Covenant

A stewardship land trust & wildlife sanctuary — *we hold wild land in trust, forever.*

A Windows 98–themed static landing site (no build step). Style reused from the
Lucky You / Really Cool Hair retro site.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Landing page — mission, the Covenant, what we do, how land protection works, get involved |
| `covenant.html` | The full Stewardship Covenant (the org's earth-reverent identity document) |
| `preserves.html` | The Field Log — our protected preserves & sanctuary residents |
| `give.html` | Ways to give — donate, volunteer, donate land, leave an easement |
| `assets/win98.css` | Shared Windows 98 stylesheet |
| `assets/win98.js` | Shared clock / start-menu / window behavior |

## What this org is (and isn't)

- **Legally:** a secular 501(c)(3) public charity — conservation + prevention of
  cruelty to animals. Clean IRS structure, no "church" claim.
- **Culturally:** an earth-reverent stewardship community. The spiritual identity
  lives in the Covenant, the brand, and the practice — never in the tax structure.
- This is a concept/marketing site, not legal or tax advice.

## Local preview

```sh
python3 -m http.server 8080   # then open http://localhost:8080
```

## Deploy

Static site → Netlify (`publish = "."`, no build). GitHub: `lakotafox/wildhaven-covenant`.
