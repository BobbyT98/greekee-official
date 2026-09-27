# Greekee orders

Greekee's customer storefront, partner order desk, and Google Sheets reporting. Fiona handles Punggol pickup and most deliveries; Caleb handles Hougang pickup and deliveries to Hougang, Kovan or Buangkok.

| Area | Purpose |
|---|---|
| `/` | Customer menu and checkout. A request is saved first, then the customer continues on WhatsApp. |
| `/admin/` | Staff login, manual orders, order updates, and Sheets sync retry. |
| `api/`, `lib/` | Server validation, routing, and persistence. |
| `assets/catalog.js` | Shared menu prices in Singapore cents. |
| `google-sheets/Code.gs` | Signed, one-way TEST/LIVE reporting receiver. |
| `supabase/setup.sql` | Database schema and access rules. |

The order desk uses three everyday stages: **Pending payment**, **Orders accepted**, and **Delivered**. A manual order can have an agreed discount, including a full discount; the historical “FOC” label is not needed for new orders. Bank payment is checked before a paid stage is saved.

**[START_HERE.md](START_HERE.md)** is Bobby's upload and verification guide. **[Greekee_Testing_and_Production.md](Greekee_Testing_and_Production.md)** records environment separation and how old orders are reported. Keep credentials in the relevant Vercel environment and Apps Script properties, never in GitHub.

```sh
npm ci
npm test
npm run build
npm run dev
```

`public/`, `node_modules/`, and real `.env` files are generated or local and are excluded from Git. Production remains on `main` until the preview is approved.
