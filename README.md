# Candle-by-Petra — Návrh 1

Standalone homepage design draft for [Candles by Petra](https://husbauervojta.github.io/Candle-by-Petra/), built to compare a scrolling, multi-section homepage layout against the live site's single-viewport carousel homepage.

**Live:** https://husbauervojta.github.io/Candle-by-Petra-navrh1/

## What this is

A full, independent copy of the site — its own homepage (`index.html`) plus its own copies of the Shop, About and Contact pages (with working cart/checkout) — so it can be clicked through end-to-end without ever depending on the main repo. Same design system as the live site: Cormorant Garamond + Jost fonts, the gold/dark/cream palette, glass `.card` panels, origin badges, pill buttons.

Only the homepage layout differs from the live site — everything else (Shop, About, Contact, cart, checkout) is an unmodified copy.

## Structure

```
index.html          — Návrh 1 homepage (hero, featured grid, about teaser, testimonial, footer)
pages/shop/          — Shop page (copy of the live site)
pages/about/          — About page (copy of the live site)
pages/contact/        — Contact page (copy of the live site)
css/style.css        — shared stylesheet for pages/ (same as live site)
js/cart.js           — cart/checkout logic (same as live site, same backend)
images/               — product photos + logo
```

## Relationship to the main site

This is a **separate repository** from [Candle-by-Petra](https://github.com/husbauervojta/Candle-by-Petra) on purpose, so the draft and the production site never get tangled together. Changes made here don't affect the live site, and vice versa — if the real Shop/About/Contact pages change, the copies here need to be updated manually to stay in sync.
