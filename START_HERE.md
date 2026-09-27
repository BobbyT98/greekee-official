# Greekee TEST — quick guide

Updated 27 September 2026. Technical owner: Bobby. The current TEST build is on GitHub branch `greekee-order-preview`, deployed to Vercel Preview. Production stays on `main` and has not received this order-management build.

## Links and daily use

- [Customer TEST storefront](https://greekee-official-git-greekee-order-preview-greekee.vercel.app/) and [staff order desk](https://greekee-official-git-greekee-order-preview-greekee.vercel.app/admin/). These stable Preview addresses follow future commits on `greekee-order-preview`; bookmark them instead of individual deployment URLs.
- [GREEKEE TEST spreadsheet](https://docs.google.com/spreadsheets/d/1YGXHw1_KAaLs6-sur7ndsyOfYfnFyy3MOOQ6F4SpdyE/edit): **Greekee Orders — TEST**, **Fiona Dashboard — TEST**, **Caleb Dashboard — TEST**.
- The order desk requires each partner's Greekee-Test login because it contains customer phone numbers, delivery addresses and payment controls. A refresh session normally remembers the device for up to a week. Fiona and Caleb can see **both** order queues. A partner can change only orders assigned to their own location; Bobby can manage both if his staff record has both locations.

## Current TEST state

The Preview deployment for commit `0455dcdb` (**Make TEST order tabs switch faster**) is Ready. Bobby opened the order desk, saw both location queues, and confirmed tab switching is faster. The TEST Apps Script project **Greekee TEST Orders Sync** has the latest `google-sheets/Code.gs` saved and deployed as a new version of its existing Web app. `refreshGreekeeHistory` completed once. Bobby confirmed the best-selling chart starts with **Choconana 59** for Fiona and **Choconana 32** for Caleb.

The old `greekee-order-test` GitHub branch was deleted after verification that it matched `main`. Keep `greekee-order-preview` for TEST and `main` for Production. Do not run `setupGreekeeSync` again on the populated TEST spreadsheet. The original Q3 tabs are intact. The 324 old product lines are marked HISTORY in the shared TEST order tab and held separately in the private Greekee-Test Supabase legacy table; they do not appear as active orders.

## Remaining release checks

1. Fiona and Caleb should each open the **stable staff link on their own device** and sign in with their own Greekee-Test account. Each should see both queues and be able to read the other's order. Only their assigned orders should show the edit form.
2. Check the storefront, cart and order desk on a narrow phone. Desktop visual checks passed; mobile was not visually verified in the automated audit.
3. Confirm customer-facing bowl names with Fiona. The storefront currently uses “Choco Nana” and “Sunset Dream”; the historical ranking uses its Q3 names.
4. Review the remaining gaps in [QA_NOTES.md](QA_NOTES.md), especially discounts on an already saved website order and order-wide search beyond the first 100 loaded rows.

No new order was submitted for the latest speed fix. The original TEST orders remain; Production data and settings were not changed. For setup, routing and reporting details, see [Greekee_Testing_and_Production.md](Greekee_Testing_and_Production.md).
