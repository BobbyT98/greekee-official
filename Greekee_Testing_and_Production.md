# Greekee environments and reporting

Updated 27 September 2026. Technical owner: Bobby. Store: Fiona (Punggol) and Caleb (Hougang).

## Environments

| Resource | TEST | Production |
|---|---|---|
| GitHub branch | `greekee-order-preview` | `main` |
| Vercel target | Preview | Production |
| Supabase project | `mgulbszcffsihvnxmqkm` (Greekee-Test) | `msgzyactnouzznkhrvgf` (Greekee) |
| Google order tab | `Greekee Orders — TEST` | `Greekee Orders — LIVE`, planned |
| Google dashboards | Fiona and Caleb `— TEST` | Fiona and Caleb `— LIVE`, planned |
| Order capture | Enabled on the previously verified TEST Preview; verify the next deployment | New ordering flow not released |

The most recently verified Preview before this update was `https://greekee-official-qe3y31si6-greekee.vercel.app/`. This update still needs Bobby's GitHub upload, Vercel Preview build, and TEST Apps Script deployment. A Preview URL does not by itself isolate the database; keep the TEST environment variables in Preview and production settings in Production. Do not share a sync secret or receiver across environments.

## Day-to-day flow

Website checkout saves an order in Supabase TEST and offers a WhatsApp handoff. Staff add message/custom orders in the admin page. The admin page uses one stage picker: **Pending payment → Orders accepted → Delivered**. Internally, the database retains separate order and payment fields for audit and compatibility. Existing cancelled/refunded exceptions show “Needs Bobby” rather than silently changing their state. Staff must check a bank payment, or confirm a full discount left $0 due, before accepting an order. A discount is an amount on a new manual order; it does not require a separate FOC status.

Pickup routes by the chosen pickup point. Deliveries to Hougang, Kovan or Buangkok route to Caleb; other delivery areas route to Fiona. This rule applies to website and manually entered orders. Only the staff member with that location, or Bobby with both, can manage the assigned queue.

## Historical Q3 product lines

The original `🌟FIO's ORDERS Q3'26` and `🌟CALB's ORDERS Q3'26` tabs were read, never changed. Their 324 historical product lines (182 Fiona, 142 Caleb) have been copied into **Greekee Orders — TEST** as `HISTORY:` rows, with their source-tab and source-row keys. The duplicate `Greekee History — Q3 2026` tab has been removed. Both partner dashboards read the shared order tab, with current TEST metrics explicitly excluding HISTORY keys and a separate **PAST ORDERS** area reading only those keys.

The source has no unique order IDs, phone numbers, or structured add-ons. Historical lines are not reconstructed as unique orders and are **not** put into Supabase or the staff queue. Missing amounts and quantities stay blank; their order-total field stays blank and order-count/paid/unpaid helper fields are zero. Historical FOC/special wording is preserved in original notes or status for provenance; new admin orders use a discount instead. At this update the source-derived delivered totals are Fiona **210 bowls / $1,840** and Caleb **168 bowls / $1,466**. The original tabs remain the authority if these figures change later.

`refreshGreekeeHistory` in the **TEST** Apps Script editor updates marked rows by source key and refreshes both past-order dashboards. Run it after editing either original quarterly tab. It does not create a duplicate history tab, and it never needs to be run for an ordinary new website order. Do not rerun `setupGreekeeSync` on the populated TEST spreadsheet.

## Deployment and secrets

The TEST Apps Script web app verifies signed requests and writes to the TEST order tab. Its `SYNC_SECRET` lives in Script Properties; matching `SHEETS_SYNC_SECRET` and the plain `/exec` `SHEETS_SYNC_URL` live in Vercel Preview. `GREEKEE_ENVIRONMENT=TEST` belongs to Preview. Do not put secret values, customer exports, or screenshots containing them into this public GitHub repository.

A future LIVE release needs a **separate** Apps Script project and secret, `ENVIRONMENT = 'LIVE'` in its `Code.gs`, and Production-only Vercel variables. LIVE setup creates its own order and partner dashboard tabs. Historical product lines stay in TEST reporting; production customer orders start clean.

The last verified production deployment predates these changes. After Bobby uploads the files, verify the new Preview and TEST sync before deciding on a production release.
