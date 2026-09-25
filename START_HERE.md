# Greekee order setup

This package adds automatic order capture, a private partner dashboard and optional Google Sheets sync to your existing website. It is prepared code, not a live deployment. The database schema has now been installed in your existing Greekee Supabase project. Your Vercel website and Google Sheet have not been changed.

## What you get

- The same customer menu and prices as the downloaded GitHub repo.
- A saved order number before the customer sends the WhatsApp message.
- A partner page at `/admin/` with Punggol, Hougang and combined views.
- Bowls, quantities, per-bowl add-ons, customer details, order date and collection/delivery date.
- Separate payment and preparation statuses, plus who changed them and when.
- Manual order entry for WhatsApp, Instagram and other channels. This includes special orders, custom extras, agreed delivery fees and discounts.
- One-way reporting to your existing Fiona and Caleb quarterly tabs. Existing manually logged orders remain in the Sheet and are **not imported into the new dashboard**.

The new partner page uses cream, pink and berry. The storefront uses the current GitHub version as its starting point; this package does not replace it with the earlier separate design mockup.

## 1. Add your partner logins in Supabase

**Database setup is already complete** in your Greekee project (`msgzyactnouzznkhrvgf`). The order tables, staff list, payment audit history and retry queue are installed. Access checks passed and the order table is empty. No historical orders were imported.

`supabase/setup.sql` is included for reference or for setting up a separate empty preview project. You do not need to run it again on Greekee.

The Data API must be enabled with the `public` schema exposed. The script explicitly grants access only to the server role; browser roles cannot read or edit these tables. Use a separate empty test project for a preview if production data is already being collected by the time you install this.

In Supabase Authentication, create a confirmed email/password user for each partner who needs access. Give everyone their own account. There is no public sign-up page. You can disable new sign-ups in Supabase's Auth settings for this staff-only use.

Copy each user's UUID from Supabase and run this in SQL Editor, replacing the placeholder UUIDs:

```sql
insert into public.greekee_staff(user_id, display_name, locations)
values
  ('FIONA_USER_UUID', 'Fiona', array['Punggol','Hougang']),
  ('CALEB_USER_UUID', 'Caleb', array['Punggol','Hougang']);
```

Use only `array['Punggol']` or `array['Hougang']` if an account should see only one location. Creating an Auth user alone never grants partner access. To remove access, set that person's `greekee_staff.active` to false. Password resets are handled by the project owner in Supabase for this first version.

## 2. Add Vercel environment variables

Add these under your Greekee project's environment variables. Use **Preview** first. Put the actual values in Vercel, not in GitHub, this chat, or the HTML.

| Name | Value |
|---|---|
| `SUPABASE_URL` | `https://msgzyactnouzznkhrvgf.supabase.co` (or your separate test project URL) |
| `SUPABASE_PUBLISHABLE_KEY` | The project's publishable API key |
| `SUPABASE_SECRET_KEY` | The project's server secret API key |
| `ORDER_CAPTURE_ENABLED` | `true` for the test preview; keep production `false` until tested |

The new secret and publishable keys are supported. Legacy service-role/anon keys also work if your project still uses them. No Supabase keys are exposed in browser JavaScript. The `.env.example` file contains placeholders only.

Google Sheets can be connected later; leaving its two variables empty does not prevent order saving. The dashboard will clearly show that sync is not connected.

## 3. Push the files to a branch and review the preview

Unzip the package and copy its contents into the **root of your existing repository**, preserving folders such as `api`, `admin`, `assets`, `lib` and `supabase`. Do not copy the outer ZIP folder as a subfolder. Include `package.json`, `package-lock.json`, `vercel.json`, and the hidden `.gitignore` file. `node_modules`, generated `public`, and real `.env` files should not be uploaded.

Push a new branch such as `feature/greekee-order-management`. Your Vercel Git integration should build a preview for that branch. If your project has overrides, use:

- Framework preset: Other
- Node.js: 24.x
- Build command: `npm run build`
- Output directory: `public`
- Root directory: the repository root

Vercel handles the four functions under `api/`. The build copies only the storefront, assets and partner page into public output; SQL scripts and backend source are not published as static files.

Open the preview's `/admin/` page and sign in. Check both handling locations. Then submit a test storefront order and verify that it appears as pending/unpaid and that its WhatsApp link points to the correct number. You do not have to send that WhatsApp message during testing.

## 4. Connect the existing Google Sheet

This part is optional for the first deployment. Use a **copy** of your Sheet when testing. Nothing in this package has written to the original Sheet.

1. In the Sheet, open **Extensions > Apps Script**. Add the contents of `google-sheets/Code.gs` to the project without deleting unrelated existing scripts. If your project already has a `doPost` function, use a separate standalone Apps Script project with this code.
2. `SPREADSHEET_ID` is prefilled with the exact GREEKEE file you provided. **Replace it with the test copy's ID for testing.** A copied Sheet does not automatically change this constant.
3. In Apps Script Project Settings > Script Properties, add `SYNC_SECRET`: a randomly generated string of at least 32 characters. One way to generate it locally is `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Use this secret only in Apps Script and Vercel.
4. Run `setupGreekeeSync` once and authorise access to the spreadsheet. This checks the order headers on row 21, reserves columns W:AF for sync metadata, sets the spreadsheet timezone to Singapore, and extends the existing dashboard's SUMIF/SUMIFS ranges so appended rows are included. It preserves existing A:J order rows.
5. Deploy as a **Web app**, executing as you, with access set to **Anyone**. If your Google Workspace administrator disallows this deployment setting, do not weaken the organisation's policy: leave sync disabled until an approved integration is available. The endpoint authenticates signed requests; it does not provide a readable order-list endpoint.
6. Add `SHEETS_SYNC_URL` in Vercel with the deployment's `/exec` URL, and `SHEETS_SYNC_SECRET` with the exact same secret. Redeploy the Vercel preview after adding variables.
7. Create an order and update its status. Confirm that the **same rows** update rather than duplicate. Historical manually entered rows should remain untouched.

The sync picks the correct quarter from the **order date**. For Q3 2026, it recognises your Fiona/Punggol and Caleb/Hougang order tab names, including the punctuation-stripped names in the Excel export. It stops safely if it finds no matching tab, multiple matching tabs, unexpected headers, or occupied metadata columns.

Before the next quarter, either prepare your own matching tabs or run `createNextQuarterTabs`. That optional function creates empty tabs with the same order columns and basic delivered totals; it does not copy charts or old orders. Old orders continue syncing to their original quarter when their status changes.

### How the Sheet columns work

| Sheet field | Saved value |
|---|---|
| A Name | Customer name |
| B Product | Canonical chart name, e.g. Choconana or Special Order |
| C Quantity | Quantity of this exact bowl combination |
| D Status | Preparation status; Completed becomes Delivered |
| E Order date | Date the order was placed |
| F Delivery date | Collection or delivery date |
| G Price | Whole line's product total after allocated discount; excludes delivery |
| H Sales platform | Website, WhatsApp, Instagram, etc. |
| I Point of contact | Fiona/Caleb by default, or manual entry |
| J Notes | Notes, add-ons, payment label and pickup time |
| W:AF | Stable sync key, order number, revision, payment, add-ons, total, delivery, discount and payment-check timestamp |

The existing Sheet's revenue formulas still count **Delivered product totals**, as they do today. They are not bank receipts and do not automatically deduct refunds. The partner dashboard's **Paid total** counts orders currently marked paid, includes delivery, and excludes fully refunded orders. These measures can differ. Dashboard totals cover only the loaded orders matching the visible filters; use Load more or Sheets for broader reporting.

Each item combination gets its own Sheet row. The overall order total and delivery fee appear only once in the added metadata columns to avoid double counting. Add-ons are per bowl. Opening WhatsApp does not mark a request confirmed or paid.

Successful saves attempt to sync immediately. If Google is unavailable, the order stays saved and unsynced. Use **Retry Sheets sync** in the dashboard to retry batches. There is no scheduled retry worker in this first version. Do not edit the generated rows in Sheets; future syncs overwrite those edits. Keep using the partner page for new order updates.

## 5. Enable production

After verifying the preview, set the corresponding **Production** variables in Vercel and point sync to the original Sheet's Apps Script deployment when ready. Merge/push the tested branch to `main`, then verify one real-world-sized test order on the production website. Set `ORDER_CAPTURE_ENABLED=true` only when the database setup is complete.

**Uploading the code alone does not connect the database or Google Sheet.** Until capture is enabled, the storefront continues to hand orders to WhatsApp without claiming they were saved. If capture is enabled but saving fails, the customer sees an error and can retry the same submission; it does not silently bypass order capture.

For a quick operational rollback, set `ORDER_CAPTURE_ENABLED=false` and redeploy. This returns customer checkout to the WhatsApp-only path without deleting saved orders. You can also roll back the code deployment in Vercel.

## Daily use

- Website requests arrive as **Pending confirmation + Unpaid**.
- Confirm availability in WhatsApp, then mark the order **Confirmed** in the partner page.
- Check the bank account, change payment to **Paid**, tick the verification box and save.
- Move preparation through **Preparing**, **Ready** and **Completed**.
- Add Instagram/WhatsApp-only orders using **Add an order**.
- You can correct contact details, notes, address and due dates. Bowl combinations, quantities, handling location and prices are fixed after saving in this first version: cancel and recreate the order if those need correcting. If money has already been received, reconcile the old/new orders before marking payments so it is not counted twice.
- Refund status represents a **full refund**; partial refunds are not supported yet.

## Verification completed here

- Executed the schema and role/security tests against an isolated PostgreSQL engine (PGlite).
- Installed the schema on your live empty Greekee Supabase project, checked all four tables have RLS enabled, and verified browser roles have no table access. Security advisors returned only informational notices about deliberately absent browser policies.
- Tested prices, per-bowl extras, delivery routing, time rules, duplicate submissions, concurrent edits, payment audit events, staff access and rate limits.
- Tested the Apps Script receiver with an in-memory Sheets mock, including duplicate/out-of-order retries, interrupted writes, signed requests and preservation of manual history.
- Passed desktop (1440px) and mobile (390px) browser checks for login, location filters, manual extras, payment verification, checkout capture, safe retries and repeat purchases. These used fictional orders and intercepted API responses; no customer or bank data was used.
- Live Supabase Auth/Data API, Vercel deployment and Apps Script authorisation still need the account setup and preview checks above. No live integration success is claimed.

## Developer commands

```bash
npm ci
npm test
npm run build
# Optional local real-backend testing: put test project variables in .env.local
npm run dev
```

The app has no runtime npm dependencies. PGlite is a pinned development-only dependency for database tests. Menu prices and options are shared in `assets/catalog.js`; descriptions and photographs remain in the storefront.

References used for implementation:
- https://supabase.com/docs/guides/api/securing-your-api
- https://supabase.com/docs/guides/getting-started/api-keys
- https://vercel.com/docs/functions/runtimes/node-js
- https://developers.google.com/apps-script/reference/utilities/utilities
