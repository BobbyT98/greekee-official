# Greekee setup — current handoff

Read [Greekee_Testing_and_Production.md](Greekee_Testing_and_Production.md) for verified project IDs, preview URLs, deployment status and separation rules. Bobby owns the technical accounts. Fiona handles Punggol; Caleb handles Hougang. Never paste passwords or API keys into GitHub or chat.

## Fiona: where we are now

The latest preview has the new phone picker. Bobby tested a US number and add-ons; those orders reached **Greekee-Test** only. Automatic sync now sends TEST orders to the two dedicated tabs in the existing Google Sheet. The redesigned dashboard shows four metric cards and four charts.

1. Use the latest verified Preview at `https://greekee-official-gg12drdaw-greekee.vercel.app/` for further testing. It is branch `greekee-order-preview`, deployment `dpl_A3eCM7PZip3wh47WYbxBuwUb19BP`; Production `main` is separate.
2. In the staff dashboard, check the saved TEST orders, update an order, and verify its existing Sheet rows update without duplicates. Check both Punggol and Hougang permissions before launch.
3. Review the TEST dashboard and storefront with Fiona and Caleb. Then plan the separate LIVE Apps Script receiver and production release. Do not put the TEST receiver URL or secret in Production.

The earlier sync issue was resolved on 26 September 2026. `SHEETS_SYNC_URL` initially contained Markdown link syntax (`[URL](URL)`); it must contain only the plain `/exec` URL. After correcting the Preview value and rotating the TEST secret in both Apps Script and Vercel Preview, retry synced all four saved TEST orders. Never paste the secret into documentation or chat.

## What is working

- Production Supabase project `msgzyactnouzznkhrvgf` has the schema and the three staff accounts. Production website remains on `main` and has not received the new order code.
- Test Supabase project `mgulbszcffsihvnxmqkm` has the same schema and a separate Bobby account.
- The latest Vercel Preview `greekee-official-gg12drdaw-greekee.vercel.app` connects to Greekee-Test with order capture and TEST Sheets sync enabled. All four test orders show synced revision 1.
- Foreign phone entry and add-ons saved in the test project, with no matching order in production. The old preview connected to production was deleted.
- The TEST order and dashboard tabs were created in the existing spreadsheet. The dashboard has four metric cards and four charts. It showed 4 orders, 12 bowls, $0 paid, $87.80 unpaid after sync. The pending count is formatted as a count (4). The dashboard source code was committed on `greekee-order-preview` at `2742b93c79073c7542364dd7087989c0de6c0971`.

## How Fiona and Caleb will handle incoming orders

The **staff order desk** at `/admin/` on the new site is the daily workspace. A website order appears there as pending and unpaid. For an Instagram, WhatsApp or other message order, staff use **+ Add an order** and enter the customer, phone, bowl lines, add-ons, dates and quantities. Use the location button, preparation/payment filters, date filters or search to find it; open the order to see details and update status. Check the actual payment before marking it paid. Use **Refresh** to fetch new orders; there is no automatic notification yet.

Fiona's intended access is Punggol, Caleb's is Hougang, and Bobby can oversee both. Currently only Bobby has a staff login in **Greekee-Test**, so Fiona and Caleb cannot yet use this Preview with their own accounts. Their existing production accounts are separate and do not automatically grant access to Greekee-Test. Bobby should set up their TEST Auth users and staff location mappings before partner testing; do not share passwords.

The **Greekee Orders — TEST** Sheet tab is a reporting copy, now styled for scanning with a fixed header and order/customer columns, location/date filters, status colours and hidden sync/accounting helper columns. Saved filter views **Fiona · Punggol orders** and **Caleb · Hougang orders** show each location, sorted by collection/delivery date. These are viewing shortcuts, not access controls: everyone with Sheet access can still see both locations. One order can occupy several product rows; the order total appears once. Use the **Greekee Dashboard — TEST** for overall metrics and charts. Edit orders and payment/preparation state in the staff order desk, not the Sheet. The older quarterly tabs remain separate; real incoming orders still follow the current process until the new system is promoted to Production.

## Code update

The order-system code, dashboard generator and prior documentation updates are on `greekee-order-preview`. This handoff update still needs to be committed to that same branch. Keep `main` untouched until preview checks pass. Do not upload `node_modules`, generated `public`, or any real `.env` file.

The build installs the exact pinned `libphonenumber-js` dependency, then places its browser bundle in public assets. Both public checkout and the partner dashboard show country selection, defaulting to Singapore. The server checks the phone number again and saves international format, e.g. `+6591234567`.

## Google Sheets: new tabs only

The old quarterly-tab instructions have been retired. `google-sheets/Code.gs` now creates **Greekee Orders — TEST** and **Greekee Dashboard — TEST** in the existing GREEKEE spreadsheet. It does not edit Fiona's or Caleb's older quarterly tabs.

If rebuilding TEST sync, use a **separate Apps Script project** containing this `Code.gs`, leave `ENVIRONMENT = 'TEST'`, and set a random `SYNC_SECRET` of at least 32 characters in its Script Properties. Run `setupGreekeeSync` once and authorize the script, then check that only the two new TEST tabs appeared. Deploy a Web app that executes as the owner and accepts requests from Anyone; signed requests are checked before writing. In Vercel Preview only, add `GREEKEE_ENVIRONMENT=TEST`, `SHEETS_SYNC_URL` (the plain `/exec` URL), and `SHEETS_SYNC_SECRET` (same secret). Redeploy a fresh preview, then test one order and update it. Check that the same rows update rather than duplicate.

For live reporting later, create a **different Apps Script project** using the same code but set `ENVIRONMENT = 'LIVE'` and a different `SYNC_SECRET`. It creates **Greekee Orders — LIVE** and **Greekee Dashboard — LIVE**. Put that project's URL, secret and `GREEKEE_ENVIRONMENT=LIVE` in Vercel Production only after the test passes. Do not share a secret or receiver URL across environments.

The dashboard shows order count, bowls to prepare, paid total, unpaid amount, location counts, pending orders and delivered product revenue. Order totals and delivery fees are recorded once per order; quantities and products are recorded per bowl line. Existing manually entered history stays in its original tabs and is not imported.

## Before production launch

Verify the new preview's storefront and staff forms, phone validation, one test order with an add-on, and the TEST Sheet receiver. Check that neither production orders nor LIVE or historical Sheet tabs changed. Then review the code update and merge to `main`. Set production order capture on only when ready for real customer orders.

Tests run locally with `npm ci`, `npm test` and `npm run build`. The package has no real credentials.
