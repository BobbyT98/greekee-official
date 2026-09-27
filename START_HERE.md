# Greekee TEST — quick guide

Updated 27 September 2026. Technical owner: Bobby. The current TEST build is on GitHub branch `greekee-order-preview`, deployed to Vercel Preview. Production stays on `main` and has not received this order-management build.

## Links and daily use

- [Customer TEST storefront](https://greekee-official-git-greekee-order-preview-greekee.vercel.app/) and [staff order desk](https://greekee-official-git-greekee-order-preview-greekee.vercel.app/admin/). These stable Preview addresses follow future commits on `greekee-order-preview`; bookmark them instead of individual deployment URLs.
- [GREEKEE TEST spreadsheet](https://docs.google.com/spreadsheets/d/1YGXHw1_KAaLs6-sur7ndsyOfYfnFyy3MOOQ6F4SpdyE/edit): **Greekee Orders — TEST**, **Fiona Dashboard — TEST**, **Caleb Dashboard — TEST**.
- The order desk requires each partner's Greekee-Test login because it contains customer phone numbers, delivery addresses and payment controls. A refresh session normally remembers the device for up to a week. Fiona and Caleb can see **both** order queues. A partner can change only orders assigned to their own location; Bobby can manage both if his staff record has both locations.

## Current TEST state

The TEST Preview is Ready. Bobby opened the order desk, saw both location queues, and confirmed tab switching is faster. Caleb and Fiona now have separate active, confirmed **Greekee-Test** Auth users and staff rows. The team confirmed partner login, shared read access and assigned-location edit controls, plus the storefront checkout and admin layout on a phone. The TEST Apps Script project **Greekee TEST Orders Sync** has the latest `google-sheets/Code.gs` saved and deployed as a new version of its existing Web app. `refreshGreekeeHistory` completed once. Bobby confirmed the best-selling chart starts with **Choconana 59** for Fiona and **Choconana 32** for Caleb.

The old `greekee-order-test` GitHub branch was deleted after verification that it matched `main`. Keep `greekee-order-preview` for TEST and `main` for Production. Do not run `setupGreekeeSync` again on the populated TEST spreadsheet. The original Q3 tabs are intact. The 324 old product lines are marked HISTORY in the shared TEST order tab and held separately in the private Greekee-Test Supabase legacy table; they do not appear as active orders.

Customer checkout requires **at least 24 hours' notice** for pickup and delivery. Pickup slots are measured from the order time. Delivery has no selected hour, so its chosen date must start at least 24 hours after the order; this may mean the day after tomorrow. Staff can still enter a manually agreed exception or backfill a past order. No database, Supabase Auth or Apps Script change is required. Check the Preview date picker after uploading the pre-order code.

## Remaining work before Production

1. Confirm customer-facing bowl names with Fiona. The storefront currently uses “Choco Nana” and “Sunset Dream”; the historical ranking uses its Q3 names.
2. Decide whether to add a discount edit for an already saved website order; today discount applies when creating a manual order.
3. Review the order-wide search/count limitations beyond the first 100 loaded rows in [QA_NOTES.md](QA_NOTES.md).
4. Repeat a saved order and sync check in TEST before a Production release, then prepare separate LIVE Sheets and Production settings. Do not promote the current Preview by accident.

No new order was submitted for the latest speed fix. The original TEST orders remain; Production data and settings were not changed. For setup, routing and reporting details, see [Greekee_Testing_and_Production.md](Greekee_Testing_and_Production.md).
