# Greekee setup — current handoff

Read [Greekee_Testing_and_Production.md](Greekee_Testing_and_Production.md) for verified project IDs, preview URLs, deployment status and separation rules. Bobby owns the technical accounts. Fiona handles Punggol; Caleb handles Hougang. Never paste passwords or API keys into GitHub or chat.

## Fiona: where we are now

The latest preview has the new phone picker. Bobby tested a US number and add-ons; those orders reached **Greekee-Test** only. Two TEST tabs now exist in the existing Google Sheet, with a redesigned dashboard. **Automatic Sheet sync is not connected yet.**

1. Bobby replaces `google-sheets/Code.gs` in the TEST Apps Script editor and preview GitHub branch with the latest revision that builds the improved dashboard. Keep `ENVIRONMENT = 'TEST'` and keep `main` alone.
2. Deploy the Apps Script web app, then set its `/exec` URL, matching secret and `GREEKEE_ENVIRONMENT=TEST` in Vercel Preview only. Redeploy a fresh preview.
3. Sync one TEST order and check the dashboard cards and charts. Fiona's and Caleb's quarterly tabs remain as they are. Review the result before switching on LIVE reporting.

Until step 2 is complete, test orders save in Greekee-Test but do not appear in the Sheet automatically.

Current sync check: the new Preview reports Sheet sync configured, but order GK-B498EDB70F6B stayed pending and no `doPost` run appeared in Apps Script Executions. Check that the deployed web app allows **Anyone** and points to the latest saved code. Retry the pending order through the staff dashboard after fixing the receiver; do not create a duplicate order. The four revised code/documentation files listed in the environment register still need a GitHub preview-branch commit.

## What is working

- Production Supabase project `msgzyactnouzznkhrvgf` has the schema and the three staff accounts. Production website remains on `main` and has not received the new order code.
- Test Supabase project `mgulbszcffsihvnxmqkm` has the same schema and a separate Bobby account.
- The Vercel preview `greekee-official-1v4k4f2uq-greekee.vercel.app` is connected to the test project, with customer order capture enabled and Google Sheets sync disabled.
- Foreign phone entry and add-ons saved in the test project, with no matching order in production. The old preview connected to production was deleted.
- The TEST order and dashboard tabs were created in the existing spreadsheet. The dashboard has four metric cards and four charts. The latest dashboard-generating `Code.gs` is local until Bobby replaces the earlier Apps Script and GitHub copies.

## Code update

Upload the changed files to the root of branch `greekee-order-preview`, preserving the folders. The files are: `index.html`, `admin/index.html`, `admin/app.js`, `api/orders.js`, `assets/checkout.js`, `assets/phone.js`, `lib/orders.js`, `lib/sheets.js`, `scripts/build.js`, `package.json`, `package-lock.json`, `google-sheets/Code.gs`, `START_HERE.md`, and `Greekee_Testing_and_Production.md`. Do not upload `node_modules`, generated `public`, or any real `.env` file. `.env.example` is optional. Keep `main` untouched until preview checks pass.

The build installs the exact pinned `libphonenumber-js` dependency, then places its browser bundle in public assets. Both public checkout and the partner dashboard show country selection, defaulting to Singapore. The server checks the phone number again and saves international format, e.g. `+6591234567`.

## Google Sheets: new tabs only

The old quarterly-tab instructions have been retired. `google-sheets/Code.gs` now creates **Greekee Orders — TEST** and **Greekee Dashboard — TEST** in the existing GREEKEE spreadsheet. It does not edit Fiona's or Caleb's older quarterly tabs.

For test sync, Bobby should create a **separate Apps Script project** containing this `Code.gs`, leave `ENVIRONMENT = 'TEST'`, and set a random `SYNC_SECRET` of at least 32 characters in its Script Properties. Run `setupGreekeeSync` once and authorize the script, then check that only the two new TEST tabs appeared. Deploy a Web app that executes as the owner and accepts requests from Anyone; signed requests are checked before writing. In Vercel Preview only, add `GREEKEE_ENVIRONMENT=TEST`, `SHEETS_SYNC_URL` (the `/exec` URL), and `SHEETS_SYNC_SECRET` (same secret). Redeploy a fresh preview, then test one order and update it. Check that the same rows update rather than duplicate.

For live reporting later, create a **different Apps Script project** using the same code but set `ENVIRONMENT = 'LIVE'` and a different `SYNC_SECRET`. It creates **Greekee Orders — LIVE** and **Greekee Dashboard — LIVE**. Put that project's URL, secret and `GREEKEE_ENVIRONMENT=LIVE` in Vercel Production only after the test passes. Do not share a secret or receiver URL across environments.

The dashboard shows order count, bowls to prepare, paid total, unpaid amount, location counts, pending orders and delivered product revenue. Order totals and delivery fees are recorded once per order; quantities and products are recorded per bowl line. Existing manually entered history stays in its original tabs and is not imported.

## Before production launch

Verify the new preview's storefront and staff forms, phone validation, one test order with an add-on, and the TEST Sheet receiver. Check that neither production orders nor LIVE or historical Sheet tabs changed. Then review the code update and merge to `main`. Set production order capture on only when ready for real customer orders.

Tests run locally with `npm ci`, `npm test` and `npm run build`. The package has no real credentials.
