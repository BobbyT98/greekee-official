# Greekee orders

Greekee's customer storefront, partner order desk, and Google Sheets reporting. Fiona handles Punggol pickup and most deliveries; Caleb handles Hougang pickup and deliveries to Hougang, Kovan or Buangkok.

| Area | Purpose |
|---|---|
| `/` | Customer menu and checkout. A request is saved first, then the customer continues on WhatsApp. |
| `/admin/` | Staff login, shared Fiona/Caleb order view, manual orders, order updates, and Sheets sync retry. |
| `api/`, `lib/` | Server validation, routing, and persistence. |
| `assets/catalog.js` | Shared menu prices in Singapore cents. |
| `google-sheets/Code.gs` | Signed, one-way TEST/LIVE reporting receiver. |
| `supabase/setup.sql` | Database schema and access rules. |
| `supabase/test/legacy_history.sql` | TEST-only archive table for old Q3 product lines. No customer data is committed. |

The order desk uses three everyday stages: **Pending payment**, **Orders accepted**, and **Delivered**. Fiona and Caleb can see both queues, while only the assigned partner (or Bobby with both locations) can change an order. Sign-in protects customer contact and delivery details; the refresh session avoids signing in on every visit. A manual order can have an agreed discount, including a full discount; the historical “FOC” label is not needed for new orders. Bank payment is checked before a paid stage is saved. The TEST dashboards rank named bowls across Q3 history and accepted/delivered TEST orders while keeping the active-order cards separate.

Customer checkout requires **at least 24 hours of notice**. Pickup slots are checked against the actual Singapore-time slot. Delivery has a date but no chosen time, so the earliest offered date has its start at least 24 hours away; timing is confirmed later. Staff can still record an agreed exception or an older order manually, with their usual location permissions.

**[START_HERE.md](START_HERE.md)** is Bobby's current TEST operating guide. **[Greekee_Testing_and_Production.md](Greekee_Testing_and_Production.md)** records environment separation and how old orders are reported. **[QA_NOTES.md](QA_NOTES.md)** tracks verified behavior and remaining checks. Keep credentials in the relevant Vercel environment and Apps Script properties, never in GitHub.

```sh
npm ci
npm test
npm run build
npm run dev
```

`public/`, `node_modules/`, and real `.env` files are generated or local and are excluded from Git. Production remains on `main` until the preview is approved.

## TEST delivery pricing (27 September 2026)

All trips are planned from Punggol on Bobby's motorcycle. These customer fees are in Singapore dollars. The team confirms timing on WhatsApp; website orders remain requests until confirmed. Special destinations are by arrangement, including access requirements.

| Area | Examples | Fee | Schedule | Free delivery |
|---|---|---:|---|---|
| Nearby | Punggol, Sengkang, Hougang, Kovan, Buangkok | $4 | Daily | Subtotal $35+ |
| East | Pasir Ris, Tampines, Bedok, Changi residential | $6 | Daily | Subtotal $35+ |
| North and central | Yishun, Woodlands, Bishan, Toa Payoh, city | $10 | Weekends | Subtotal $50+ |
| South and West | Queenstown, Clementi, Bukit Batok, Jurong East | $10 | Weekends | Subtotal $50+ |
| Far West / special | Jurong West, Tuas, Sentosa, other or restricted | $15 | By arrangement | Subtotal $50+ |

Checkout groups the named areas under East, North, South, West and Special. The selected area sets the fee. Free-delivery thresholds use the bowl subtotal before delivery and any manual discount. Hougang, Kovan and Buangkok still belong to Caleb's queue; every other delivery belongs to Fiona's. Admin can enter an agreed fee for a manual order. Server validation recalculates the fee and checks that the area matches its region. Change `assets/catalog.js` and the checkout/admin/server tests together when adjusting rates. Production `main` is not part of this TEST change.
