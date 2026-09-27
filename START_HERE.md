# Greekee preview handoff

For Bobby. This update is for the **`greekee-order-preview`** GitHub branch and Vercel Preview only. Do not merge it to `main` yet.

## What Fiona and Caleb will see

1. The new storefront design from Fiona's `index(2).html`, with the existing saved checkout and international phone validation integrated. Customers still send a WhatsApp message after the request is saved.
2. In `/admin/`, each new order starts as **Pending payment**. After checking payment, choose **Orders accepted**; after handoff, choose **Delivered**. For a complimentary order, set the agreed discount on the manual-order form and confirm its $0 balance before accepting it.
3. The [GREEKEE TEST spreadsheet](https://docs.google.com/spreadsheets/d/1YGXHw1_KAaLs6-sur7ndsyOfYfnFyy3MOOQ6F4SpdyE/edit) has **Greekee Orders — TEST**, **Fiona Dashboard — TEST**, and **Caleb Dashboard — TEST**. The 324 old Q3 product lines are marked HISTORY in the shared order tab. They are reporting rows only; they do not appear in the admin queue or the new-order totals. The duplicate History tab has been removed. Original Fiona and Caleb Q3 tabs remain intact.

## Upload and deploy

1. Open the supplied update ZIP. Upload each file into the **same folder path shown in the ZIP** on `greekee-order-preview`. Upload the files themselves, not the enclosing ZIP or its parent folder. Keep the repository layout below.
2. Wait for Vercel to build a **new Preview** deployment. Check that Preview still points to the **Greekee-Test** Supabase project. Do not promote the deployment to Production.
3. In the existing **Greekee TEST Orders Sync** Apps Script project, replace `Code.gs` with `google-sheets/Code.gs` from this update. Save it and deploy a **new version of the existing Web app**. Keep the existing TEST secret and `/exec` URL. **Do not run `setupGreekeeSync` again.**
4. Run `refreshGreekeeHistory` **once** in that TEST Apps Script editor. It matches existing HISTORY keys to the original Q3 source rows and refreshes the two past-orders dashboard sections; it does not create a History tab or edit the originals.
5. On the new Preview, verify a test order with an add-on and foreign or Singapore phone number, then update it through all three admin stages. Check that the same TEST order updates in Google Sheets and that the old HISTORY lines remain separate from its metrics.

Files in this update: `index.html`, `assets/checkout.js`, `admin/index.html`, `admin/app.js`, `admin/style.css`, `google-sheets/Code.gs`, `lib/orders.js`, `tests/orders.test.js`, `tests/sheets.test.js`, `README.md`, `START_HERE.md`, and `Greekee_Testing_and_Production.md`. Keep their folder paths. Do not upload `public/`, `node_modules/`, `.env.local`, test customer exports, or credentials.

## Access and ownership

Fiona handles Punggol pickup and most deliveries. Caleb handles Hougang pickup and deliveries to Hougang, Kovan or Buangkok. A staff account scoped to one location cannot add an order routed to the other. Production and TEST staff accounts are separate; Bobby can set up Fiona and Caleb in Greekee-Test before their own login checks. Saved Sheet filters make the tab easier to read but do not restrict who can see its rows.

For deeper environment details, see [Greekee_Testing_and_Production.md](Greekee_Testing_and_Production.md).
