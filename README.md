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

**[START_HERE.md](START_HERE.md)** is Bobby's upload and verification guide. **[Greekee_Testing_and_Production.md](Greekee_Testing_and_Production.md)** records environment separation and how old orders are reported. Keep credentials in the relevant Vercel environment and Apps Script properties, never in GitHub.

```sh
npm ci
npm test
npm run build
npm run dev
```

`public/`, `node_modules/`, and real `.env` files are generated or local and are excluded from Git. Production remains on `main` until the preview is approved.
