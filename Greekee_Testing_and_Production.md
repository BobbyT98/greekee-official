# Greekee environments and reporting

Updated 27 September 2026. Technical owner: Bobby. Store: Fiona (Punggol) and Caleb (Hougang).

## Environments

| Resource | TEST | Production |
|---|---|---|
| GitHub branch | `greekee-order-preview` | `main` |
| Vercel target | Preview | Production |
| Supabase project | `mgulbszcffsihvnxmqkm` (Greekee-Test), including a separate Q3 legacy table | `msgzyactnouzznkhrvgf` (Greekee) |
| Google order tab | `Greekee Orders — TEST` | `Greekee Orders — LIVE`, planned |
| Google dashboards | Fiona and Caleb `— TEST` | Fiona and Caleb `— LIVE`, planned |
| Order capture | Enabled in TEST Preview; no new order submitted for the latest UI update | New ordering flow not released |

The current Preview is Ready on commit `0455dcdb` and follows the stable branch address `https://greekee-official-git-greekee-order-preview-greekee.vercel.app/`. Earlier TEST checks saved a website order with add-ons and a fully discounted manual order, routed and synced them, and verified all three stages. Bobby confirmed the latest shared queue and faster tabs, and deployed the Q3 chart source to the existing TEST Apps Script Web app; `refreshGreekeeHistory` completed and both best-selling charts matched. No new order was submitted for the latest UI update. A Preview URL does not by itself isolate the database; keep the TEST environment variables in Preview and production settings in Production. Do not share a sync secret or receiver across environments.

The redundant `greekee-order-test` GitHub branch was deleted on 27 September 2026, and a remote branch check confirmed it is gone. It was a branch at the same commit as `main`, not the TEST database or active Preview. Keep `greekee-order-preview` for TEST changes.

## Day-to-day flow

Website checkout saves an order in Supabase TEST and offers a WhatsApp handoff. Staff add message/custom orders in the admin page. The admin page uses one stage picker: **Pending payment → Orders accepted → Delivered**. Internally, the database retains separate order and payment fields for audit and compatibility. Existing cancelled/refunded exceptions show “Needs Bobby” rather than silently changing their state. Staff must check a bank payment, or confirm a full discount left $0 due, before accepting an order. A discount is an amount on a new manual order; it does not require a separate FOC status.

Pickup routes by the chosen pickup point. Deliveries to Hougang, Kovan or Buangkok route to Caleb; other delivery areas route to Fiona. This rule applies to website and manually entered orders. Every active partner can read both queues and use the All / Punggol / Hougang filters. Only the staff member with that location, or Bobby with both, can add or change an order for the assigned queue. The API checks this even if someone changes the browser interface. The login remains necessary because the queue includes customer phone numbers, addresses and payment actions; an existing refresh session normally signs the partner back in automatically.

## Historical Q3 product lines

The original `🌟FIO's ORDERS Q3'26` and `🌟CALB's ORDERS Q3'26` tabs were read, never changed. Their 324 historical product lines (182 Fiona, 142 Caleb) have been copied into **Greekee Orders — TEST** as `HISTORY:` rows, with their source-tab and source-row keys. The duplicate `Greekee History — Q3 2026` tab has been removed. Both partner dashboards read the shared order tab. Their **Best-selling bowls** chart includes named Q3 history plus accepted/delivered TEST bowls, ranked by known quantity. Generic “Special Order” lines are excluded because they do not name a specific bowl. Current-order cards, preparation, payment, seven-day, progress and payment charts explicitly exclude HISTORY keys. A separate **PAST ORDERS** area reads only those keys.

The source has no unique order IDs, phone numbers, or structured add-ons. Historical lines are not reconstructed as unique orders and do not enter `greekee_orders` or the staff queue. Greekee-Test Supabase has a private `greekee_legacy_order_lines` table containing the 324 source-keyed product lines (182 Fiona, 142 Caleb). This is a snapshot for visibility and research, not an order queue or a source for the Google dashboard. Row-level security is enabled and browser roles cannot read it. Missing amounts and quantities stay null there and blank in Sheets; the historical order-total field stays blank and order-count/paid/unpaid helper fields are zero. Historical FOC/special wording is preserved in original notes or status for provenance; new admin orders use a discount instead. At this update the source-derived delivered totals are Fiona **210 bowls / $1,840** and Caleb **168 bowls / $1,466**. The original tabs remain the authority if these figures change later.

`refreshGreekeeHistory` in the **TEST** Apps Script editor updates marked Sheet rows by source key, refreshes the best-selling chart source, and refreshes both past-order sections. Run it after editing either original quarterly tab. It does not create a duplicate history tab, and it never needs to be run for an ordinary new website order. The Supabase legacy table is a one-time snapshot and does **not** auto-update when old source rows change; Bobby should reconcile it separately if the original Q3 tabs are edited. Do not rerun `setupGreekeeSync` on the populated TEST spreadsheet.

## Deployment and secrets

The TEST Apps Script web app verifies signed requests and writes to the TEST order tab. Its `SYNC_SECRET` lives in Script Properties; matching `SHEETS_SYNC_SECRET` and the plain `/exec` `SHEETS_SYNC_URL` live in Vercel Preview. `GREEKEE_ENVIRONMENT=TEST` belongs to Preview. Do not put secret values, customer exports, or screenshots containing them into this public GitHub repository.

A future LIVE release needs a **separate** Apps Script project and secret, `ENVIRONMENT = 'LIVE'` in its `Code.gs`, and Production-only Vercel variables. LIVE setup creates its own order and partner dashboard tabs. Historical product lines stay in TEST reporting; production customer orders start clean.

The last verified production deployment predates these changes. Keep the Q3 legacy SQL file and imported customer data confined to Greekee-Test. The public GitHub repository contains the table schema only, no historical customer rows. The TEST dashboard and Apps Script deployment are current. Greekee-Test now has active, confirmed Auth users and staff access for Bobby (both locations), Caleb (Hougang) and Fiona (Punggol); Production Auth accounts remain separate. The team reported successful partner login, shared read access with assigned-location edits, and readable storefront/admin layouts on a phone. Recheck a saved TEST order and sync, menu names, and the remaining QA gaps before deciding on a production release.
