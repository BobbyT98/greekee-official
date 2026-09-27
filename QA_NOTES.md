# Greekee TEST — checkout and order desk audit

27 September 2026. Scope: deployed Preview storefront on desktop; updated source, API, database and Sheets tests; Bobby's live queue and chart checks after deployment. This is a TEST audit. No new order was submitted during this pass, and Production was not changed.

## Verified

| Area | Result |
|---|---|
| Desktop storefront/cart | Menu, bowl cards, add-to-cart, cart drawer, total and fixed Save button rendered clearly at 1363 × 936. |
| Checkout validation | Empty name and too-short Singapore phone produced inline errors before saving. |
| Delivery pricing | East Pasir Ris showed a $6 fee, and changing to Kovan recalculated the fee to $4 for the same $8.90 bowl. |
| Routing and safety | Automated tests cover location assignment, server-calculated price and add-ons, phone country lengths, pickup slots, discounts, parallel duplicate submissions, payment audit, revision conflicts, and TEST Sheets retries. |
| Shared admin access | New API test checks that a Punggol partner can read a Hougang queue and order, but a cross-location PATCH is denied. The UI shows cross-location details without an edit form. |
| Build | `npm test`: 31 passed, 0 failed. `npm run build`: passed. |
| Live follow-up | Bobby saw both queues, confirmed fast tab switching, deployed the existing TEST Apps Script Web app, ran `refreshGreekeeHistory`, and saw Choconana 59/32 lead the two charts. |
| Partner and phone checks | Fiona and Caleb's Greekee-Test accounts were created, confirmed and assigned to their own locations. The team reported successful login and cross-location read-only checks. Bobby reported the storefront/cart and admin layout looked good on a phone. |

## Fixed in this update

1. **Pickup labels for overseas customers.** The storefront displayed a Singapore pickup instant in the visitor's browser time zone. It now formats both date and time with `Asia/Singapore`, matching the saved slot and server validation. Checked with an America/Los_Angeles process time zone.
2. **Order flow wording.** The How to Order section now says the request is saved before WhatsApp opens.
3. **Shared queue visibility.** Fiona and Caleb can read both location queues. Their own location remains the boundary for adding and changing orders. Bobby can manage both when his staff record includes both locations.
4. **Accessible checkout controls.** The phone input has a real label, and the selected pickup/delivery and location buttons expose their pressed state to assistive technology.
5. **Historical bowl chart source.** The live TEST Sheet was already corrected to include named Q3 history plus accepted/delivered TEST bowls; this package keeps Apps Script and GitHub source aligned. History does not inflate current-order counts.
6. **Order desk tab speed (follow-up).** Switching between All, Fiona and Caleb now filters the already loaded complete order list in the browser. The Refresh button and edits still request current data. For a queue larger than the first 100 orders, tabs keep their server request so the view is not mistaken for a complete list. A request sequence check prevents a slow earlier response from replacing the newest tab.

## Remaining checks and improvements

| Priority | Item | Why it matters / next check |
|---|---|---|
| Before release | Confirm customer-facing bowl names against the intended menu. | The site says “Choco Nana” and “Sunset Dream”; the historical chart uses “Choconana” and older Q3 names. Prices and IDs were deliberately left unchanged pending menu confirmation. |
| Before Production | Repeat a saved TEST checkout and Sheets sync on the final code. | The prior end-to-end saved orders passed before the latest UI and shared-read changes. Recent checks avoided adding extra test orders. |
| Later | Let staff apply or revise a discount on an already saved website order, with a reason and audited total recalculation. | Today the discount is only in the **new manual order** form. This matters for a FOC decision made after a website checkout. |
| Later | Consider an order-wide search or server-side stage filter for busy periods. | The page loads 100 orders at a time; search, status and summary cards filter/count only loaded rows, as the on-screen note says. |

The admin login remains in place because the order desk contains private phone numbers, delivery addresses and payment actions. The refresh cookie lasts up to seven days, so ordinary return visits can reopen the desk without typing the password again. Removing login would expose those details to anyone with the URL. The automated mobile screenshot tool timed out; the phone layout conclusion is Bobby's manual check.
