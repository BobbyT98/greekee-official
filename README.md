# Greekee

Customer ordering and a private partner order desk for Punggol and Hougang.

**Start with [START_HERE.md](START_HERE.md)** for Supabase, partner accounts, Vercel variables, preview testing and optional Google Sheets sync.

- `/` — existing storefront with server-validated order capture and WhatsApp handoff.
- `/admin/` — partner login, location filters, orders, manual entry and payment history.
- `api/` — four Vercel Node.js functions. Secrets stay on the server.
- `supabase/setup.sql` — initial database schema, private access and audit history.
- `google-sheets/Code.gs` — signed, one-way sync to new TEST or LIVE order and dashboard tabs.
- `assets/catalog.js` — shared menu prices in Singapore cents.

```sh
npm ci
npm test
npm run build
npm run dev
```

Order capture is off until `ORDER_CAPTURE_ENABLED=true`. WhatsApp and manual bank-payment checks remain part of the workflow. This does not add a payment gateway or import past orders.
