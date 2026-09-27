# Greekee TEST update — Bobby's steps

This update is prepared locally but **has not been uploaded or deployed**. Work only on GitHub branch `greekee-order-preview`. It deploys to Vercel Preview, connected to Greekee-Test Supabase. Leave `main` and Production alone.

## 1. Upload to GitHub

Unzip the update package. On `greekee-order-preview`, upload each file to the same folder shown in the ZIP (for example, `api/orders.js` belongs inside `api/`). Commit the files. Do not upload the ZIP itself or its enclosing folder. The files are `index.html`, `admin/index.html`, `admin/app.js`, `api/orders.js`, `tests/api.test.js`, `google-sheets/Code.gs`, `supabase/test/legacy_history.sql`, `README.md`, `START_HERE.md`, `Greekee_Testing_and_Production.md`, and `QA_NOTES.md`.

The `supabase/test/legacy_history.sql` file documents the **already applied TEST-only table**. Do not run it again or run it in Production. No Vercel environment variable or database setting needs changing for this update.

## 2. Check the new Vercel Preview

Wait for the deployment from `greekee-order-preview` to say **Ready**. Open its Preview URL, not the Production domain. Check the menu, add a bowl, and open the cart without submitting another test order. Check that pickup times are labelled in Singapore time, including on a device using another time zone.

Open `/admin/` on that Preview. Sign in with each partner's existing Greekee-Test account. Fiona and Caleb should both see **All locations**, **Punggol · Fiona**, and **Hougang · Caleb**. Each can open the other's order and read the details. The other person's order should have no edit form; an assigned order has one. Bobby, if his staff account includes both locations, can edit both. The sign-in is intentionally kept for customer privacy; a valid refresh session normally restores access on later visits.

## 3. Keep TEST Google Sheets code current

In the existing **Greekee TEST Orders Sync** Apps Script project, replace `Code.gs` with this package's `google-sheets/Code.gs`. Save and deploy a **new version of the existing Web app**. Keep the existing TEST secret and `/exec` URL. Do **not** run `setupGreekeeSync` again.

Run `refreshGreekeeHistory` **once** in the TEST Apps Script editor. It refreshes the old Q3 source rows and the partner dashboard history sections. The live TEST Sheet's best-selling formula has already been corrected; this keeps the code in GitHub and Apps Script consistent. Check Fiona's best-selling chart starts with Choconana 59 and Caleb's with Choconana 32 as of the historical snapshot. The original Q3 tabs remain untouched.

## 4. Clean up one old GitHub branch

At [GitHub branches](https://github.com/BobbyT98/greekee-official/branches), delete **only** `greekee-order-test`. It points to the same old commit as `main` and is unused. Do **not** delete `greekee-order-preview` or `main`. The assistant could verify the branch but GitHub rejected the deletion because this workspace has no push credentials. This GitHub cleanup does **not** delete the Greekee-Test Supabase project or Vercel Preview.

## What this update changes

- Both partners can see both queues; changes remain limited to assigned locations.
- Pickup labels always show Singapore time. Checkout copy explains that saving happens before WhatsApp opens.
- Phone and pickup controls are clearer to screen readers.
- TEST Google Sheets best-selling charts include named Q3 history plus accepted/delivered TEST orders. The redundant History tab remains removed; 324 old product lines remain in the shared TEST order tab and a private TEST Supabase snapshot.

See [QA_NOTES.md](QA_NOTES.md) for the stress-test findings and [Greekee_Testing_and_Production.md](Greekee_Testing_and_Production.md) for environment details.
