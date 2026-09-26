# Greekee setup — current handoff

Read [Greekee_Testing_and_Production.md](Greekee_Testing_and_Production.md) for verified project IDs, preview URLs, deployment status and separation rules. Bobby owns the technical accounts. Fiona handles Punggol; Caleb handles Hougang. Never paste passwords or API keys into GitHub or chat.

## Fiona: where we are now

Your test order reached **Greekee-Test** only. It did not reach the production order table. The new phone picker and Google Sheet tabs are prepared in this download but **have not been uploaded or switched on online yet**.

1. Send Bobby this ZIP. Ask him to unzip it and upload its files to GitHub branch **`greekee-order-preview`** in `BobbyT98/greekee-official`, preserving the folders. Keep `main` alone.
2. Once Vercel says the new preview deployment is Ready, open the preview link, try a Singapore number and a foreign number, then add a test order with an add-on. The preview should save only to Greekee-Test.
3. Bobby can then connect the **TEST** Google Sheet receiver using the instructions below. You should see two new tabs named **Greekee Orders — TEST** and **Greekee Dashboard — TEST**. Fiona's and Caleb's quarterly tabs remain as they are. We will review this test before switching on LIVE reporting.

If step 1 is still pending, the old preview can accept test orders but will not have the new phone picker or Sheet dashboard.

## What is working

- Production Supabase project `msgzyactnouzznkhrvgf` has the schema and the three staff accounts. Production website remains on `main` and has not received the new order code.
- Test Supabase project `mgulbszcffsihvnxmqkm` has the same schema and a separate Bobby account.
- The Vercel preview `greekee-official-51jjauhf8-greekee.vercel.app` is connected to the test project, with customer order capture enabled and Google Sheets sync disabled.
- A test order was saved in the test project, while the production order table remained empty. The old preview connected to production was deleted.
- The new code in this package includes an international phone country picker and a replacement Sheets receiver for dedicated TEST/LIVE tabs. **This code change still needs to be uploaded to the GitHub test branch and redeployed before it appears online.**

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
