# Greekee: testing and production

Updated 26 September 2026, Singapore time. Owner: Bobby. Business users: Fiona (Punggol) and Caleb (Hougang).

## The rule

Test orders go only to the test database and TEST Sheet tabs. Real orders go only to the production database and LIVE Sheet tabs. A Vercel preview address alone does not isolate its database.

## Environment register

| Setting | TEST | PRODUCTION |
|---|---|---|
| Supabase project | Greekee-Test — created, schema installed | Greekee |
| Supabase project reference | mgulbszcffsihvnxmqkm | msgzyactnouzznkhrvgf |
| Website | https://greekee-official-gg12drdaw-greekee.vercel.app — READY, test sync verified | https://greekee.vercel.app |
| GitHub branch | greekee-order-preview | main |
| Vercel environment | Preview | Production |
| Google order tab | Greekee Orders — TEST (receiving test orders) | Greekee Orders — LIVE (planned) |
| Google metrics tab | Greekee Dashboard — TEST (4 cards, 4 charts, populated) | Greekee Dashboard — LIVE (planned) |
| Order system status | Isolated testing active; four orders synced | New order system not promoted |

GitHub repository: https://github.com/BobbyT98/greekee-official

Vercel project: greekee-official, team Greekee (team_gDtTclPqy8CVWJt9hfm0SXkx). Vercel connector access restored 26 September 2026; environment variable values remain private.

## Latest verified state — 26 September 2026, 17:16 SGT

Commit `2742b93c79073c7542364dd7087989c0de6c0971` on `greekee-order-preview` contains the redesigned `google-sheets/Code.gs`, test and handoff files. Vercel Preview deployment `dpl_A3eCM7PZip3wh47WYbxBuwUb19BP` is READY. `SHEETS_SYNC_URL` in Preview initially contained Markdown link syntax; it was corrected to a plain `/exec` URL. The TEST `SYNC_SECRET` was rotated in Apps Script and the matching Vercel Preview secret, then Preview was redeployed. Keep the secret out of this register and GitHub.

Retrying from the staff dashboard synchronized four saved orders, including `GK-B498EDB70F6B`. All four Greekee-Test records show `revision=1` and `synced_revision=1`. The TEST order tab has product-line rows and add-ons, and the TEST dashboard shows 4 orders, 12 bowls to prepare, $0.00 paid, $87.80 unpaid, 4 pending confirmations, and four native charts. Its pending count format was corrected directly in the TEST tab from currency to number; the checked-in `Code.gs` already uses number formatting for that count. A production database query found none of the three identified test order numbers there. The older Fiona and Caleb quarterly tabs remain separate.

Next verify an order edit updates the same rows, test Hougang access with Caleb, review the storefront/dashboard, and plan the separate LIVE receiver before merging to `main`. The sections below preserve the setup and investigation history; older pending-status statements are superseded by this verified state.

## TEST order tab readability and partner flow — 26 September 2026

The existing `Greekee Orders — TEST` tab was styled in place, without changing order values or formulas: olive header, cream alternating rows, frozen header plus order/customer columns, location/date filters, wider product and add-on fields, readable dates and currency, and coloured preparation/payment states. Sync keys and accounting helper columns are hidden but retained for the receiver and dashboard. Saved filter views `Fiona · Punggol orders` (ID `1518364465`) and `Caleb · Hougang orders` (ID `1389702870`) show location-specific lines sorted by due date; these views are convenience filters, not permissions. The revised local `google-sheets/Code.gs` applies the same visual layout when `setupGreekeeSync` builds a fresh TEST or LIVE order tab; this revision still needs to replace the Apps Script editor/deployment and be committed to the GitHub preview branch. The existing TEST tab already has the styling and continues to sync with its current deployed receiver.

The staff site `/admin/` is the operational queue: incoming web submissions start pending/unpaid; staff enter Instagram/WhatsApp orders there, filter by location, date and status, refresh for new orders, then open a record to update preparation or verified payment. Sheets receives the reporting copy and should not be edited as the source of truth. Fiona is intended for Punggol, Caleb for Hougang, and Bobby for both. Greekee-Test currently has only Bobby's staff mapping; Fiona and Caleb need separate TEST Auth users and location-scoped mappings for Preview testing. Existing Production accounts do not grant TEST access. The old quarterly tabs continue their current use until the new system is launched on `main`.

## Old preview: do not use

https://greekee-official-skyoasg77-greekee.vercel.app

This deployment uses the production Supabase project. It is NOT an isolated test environment. Stop using it and retire/delete it in Vercel when replacing it. Check for other old previews using production credentials too. Changing environment variables and redeploying does not remove old deployments or change their saved configuration.

The one identified test order, GK-45569808447E (customer Test, $18.80), and its related order events were deleted from production on 26 September 2026. A follow-up database query confirmed that order no longer exists. Its synced_revision was zero; it had not reached Google Sheets. This does not assert that every possible future test record has been removed.

## Setup sequence

1. Create Greekee-Test in Supabase, Singapore region. Check any displayed cost before creating. Keep the database password private.
2. Record its project reference in this register. Install supabase/setup.sql on this NEW EMPTY test project only. Do not rerun initial setup on production.
3. Create separate test Auth users and staff entries. Do not copy real orders or production passwords into test. Test users have different IDs from production users.
4. In Vercel, ensure SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY use the TEST project's values for Preview only. Production retains the Greekee values. Do not leave a single shared value assigned to both environments. Check branch overrides and integration-managed values.
5. Set ORDER_CAPTURE_ENABLED=true only for the isolated preview. Keep production capture disabled until approved launch. This flag controls customer checkout only: it does NOT prevent staff from saving orders and is NOT a database isolation switch.
6. Keep SHEETS_SYNC_URL and SHEETS_SYNC_SECRET unset until the revised Sheet receiver is ready. Later use distinct test/live receiver configurations and secrets, each restricted to its exact destination tabs.
7. Redeploy the test branch. Record the NEW preview URL and retire the old preview and any other previews with production database access.
8. Verify the effective project reference and configuration without exposing secrets. Only then create a clearly named TEST order. Confirm it exists in the test database and does not exist in production. Verify updates, quantities, add-ons, dates and payment/preparation status.
9. Test Sheet sync only into TEST tabs; verify all original and LIVE tabs remain unchanged. Repeated sync must update the same order rather than add duplicates.
10. Promote tested code only after the checks pass. Keep production credentials and LIVE Sheet destinations separate. Do not create fictional orders in production for launch testing.

## Google Sheets decision

Use new tabs in the existing GREEKEE spreadsheet:

https://docs.google.com/spreadsheets/d/1YGXHw1_KAaLs6-sur7ndsyOfYfnFyy3MOOQ6F4SpdyE/edit

Both locations can use one order tab per environment, with a Location column. Each dashboard reads only its matching order tab. Include order counts, bowl quantities, paid totals, unpaid amounts, preparation status and Punggol/Hougang breakdowns. Define totals so delivery, discounts, refunds and multi-item orders are not double counted.

Preserve the existing 🌟FIO's ORDERS Q3'26 (Punggol) and 🌟CALB's ORDERS Q3'26 (Hougang) tabs. No historical orders have been imported. Code for the new tabs and revised metrics is prepared locally, but has NOT been uploaded to GitHub, deployed as Apps Script, or connected to Vercel.

IMPORTANT: the old ZIP and GitHub deployment contain an obsolete Code.gs that targets quarterly tabs. Use only the replacement Code.gs from this updated package; it targets dedicated tabs and checks TEST/LIVE environment. Separate tabs still share file permissions.

## Access and handoff

- Bobby: both Punggol and Hougang.
- Fiona: Punggol only.
- Caleb: Hougang only.
- Each person uses their own login. Auth user creation alone does not grant staff access.
- Never put passwords, server keys or sync secrets in this document, GitHub, screenshots or chat.
- Before every test, check the website URL AND its database destination.
- Update this register with verified project references, deployment URLs, receiver destinations and completion dates. A planned item is not a completed item.

## Current open tasks

- Upload the prepared phone and TEST/LIVE Sheet code to the `greekee-order-preview` branch; the current preview still runs the earlier code.
- Verify the new preview's foreign phone entry and add-on order in Greekee-Test.
- Connect the TEST Apps Script receiver, verify its new tabs, and confirm older quarterly tabs and production remain untouched.
- Create the separate LIVE receiver and production settings only after TEST verification.
- Upload documentation changes to GitHub with the next code update; local files are not automatically pushed.

This document supersedes the old START_HERE.md instructions wherever they allow shared preview/production credentials, test orders in production, or sync into existing quarterly tabs.

## Verified setup update — 26 September 2026

Greekee-Test (mgulbszcffsihvnxmqkm) is ACTIVE_HEALTHY in Singapore, and was empty before setup. Applied greekee_order_management to this test project only. Four tables, server-only retry view and order/rate-limit functions installed. No production data copied. Security advisor reported only the expected informational notices for tables with RLS and no browser policies. Preview credentials, old preview retirement, test logins and Sheet sync are still pending.

## Configuration transition — 26 September 2026

Bobby test Auth user 616a2680-302d-4830-ac42-fac54e8f99e4 is confirmed; active staff access for Punggol and Hougang is configured in Greekee-Test only. Production users and their access are unchanged.

Vercel changes remain pending (assistant cannot currently inspect or edit that account):

| Variable | Production | Preview |
|---|---|---|
| SUPABASE_URL | https://msgzyactnouzznkhrvgf.supabase.co | https://mgulbszcffsihvnxmqkm.supabase.co |
| SUPABASE_PUBLISHABLE_KEY | Greekee project key | Greekee-Test project key |
| SUPABASE_SECRET_KEY | Greekee project key | Greekee-Test project key |
| ORDER_CAPTURE_ENABLED | false or absent until approved launch | true only after test credentials are connected |
| SHEETS_SYNC_URL / SHEETS_SYNC_SECRET | Unset until revised LIVE receiver is ready | Unset until revised TEST receiver is ready |

Earlier setup assigned the three production Supabase values to both Production and Preview. That must be undone: original values Production only, separate test values Preview only. Check any branch overrides. Existing integration variables POSTGRES_*, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_JWT_SECRET are not consumed by the current order code; do not delete production integration values blindly. Ensure production integration credentials are not supplied to future test deployments.

No GitHub reconnect or repository replacement is required. Keep main for production and greekee-order-preview for testing; do not merge yet. Upload this register and the corrected setup guide with the next code update. No production Supabase schema reset, user deletion or key rotation is required for this transition. No key exposure has been established.

After setting environment-specific values, build a NEW preview and retire old previews containing production credentials. The current old preview remains unsafe until retired. Do not resume tests based only on saved environment variable changes.

## Preview redeployment — 26 September 2026, 01:34 SGT

User reports the three original Supabase settings are now Production only, and separate Greekee-Test values were added for Preview only. Redeploy dialog verified Preview environment, greekee-order-preview branch, build cache unchecked. New URL: https://greekee-official-51jjauhf8-greekee.vercel.app . Assistant fetch was denied by the Vercel connection, so effective runtime database destination has NOT yet been independently verified. Next: log in with Bobby test account without creating orders; verify returned staff user ID matches 616a2680-302d-4830-ac42-fac54e8f99e4. Old skyoasg77 preview retirement is still pending.

## Verified Vercel access — 26 September 2026, 01:41 SGT

After reconnecting the Vercel plugin, the assistant can access the Greekee team and project. New preview deployment dpl_B9HuGtdPsr6scDoXBn2Cxe29TdKb is READY on branch greekee-order-preview at commit 095ac53eb06b285bf292b2f1f4acf45bc24deea6. Its /api/config returns capture_enabled=true, sheets_configured=false. Greekee-Test auth user Bobby last signed in at 01:36:42 SGT, matching the user's login on this new preview. This corroborates the test database destination without exposing keys. Old preview deployment dpl_Af1bWhrNLTpZgBUKSdVsJwXv6sd1 is still READY and should be retired; it was built before the environment split. Production main was not promoted.

## Old preview retired — 26 September 2026, 01:45 SGT

User deleted old deployment dpl_Af1bWhrNLTpZgBUKSdVsJwXv6sd1. Vercel API lookup for its skyoasg77 URL now returns 404 Deployment not found. New deployment dpl_B9HuGtdPsr6scDoXBn2Cxe29TdKb remains READY. Greekee-Test order count was zero immediately before the next isolated order test. This verifies the one identified old preview is gone; it is not an inventory of every older deployment.

## Build update — 26 September 2026 (local, not deployed)

Verified test order GK-B744ADC11D95 (TEST - Greekee, two bowls, $17.80) exists only in Greekee-Test; production order table was empty on the check. It had no add-ons, so an add-on still needs live preview testing.

The prepared code adds a country selector (Singapore default) to storefront checkout and both manual/edit partner forms. It uses pinned libphonenumber-js 1.13.14 with full numbering metadata on client and server. New phone entries normalize to international format, and wrong lengths are rejected. Legacy local Singapore numbers remain readable.

Replacement Google Apps Script receiver creates dedicated Greekee Orders — TEST/LIVE and Greekee Dashboard — TEST/LIVE tabs only. It checks a signed request's environment, uses separate receiver projects/secrets, prevents duplicate rows and stale updates, and leaves old tabs alone. Sheets sync requires explicit GREEKEE_ENVIRONMENT=TEST in Vercel Preview or LIVE in Production; with this missing, it remains off. These code changes are LOCAL and not yet in the GitHub preview; do not claim the site has the new phone picker or Sheet sync.

## Preview and dashboard update — 26 September 2026

Commit 7b4edb48c97cdf731a517c827dd4c4fd172a5816 on `greekee-order-preview` deployed READY as `greekee-official-1v4k4f2uq-greekee.vercel.app`. Production remains on main. The country picker appeared in the preview. Order GK-A6F61FB73EB8 saved to Greekee-Test with +1 US format and two plain bowls; order GK-03E895B3A4EE saved with Berry Bliss strawberry and blueberry add-ons, other bowl lines and $26.60 total. Neither order number was found in production.

The separate TEST Apps Script project was created and `setupGreekeeSync` produced Greekee Orders — TEST and Greekee Dashboard — TEST in the existing GREEKEE spreadsheet. Their original quarterly tabs remain. The dashboard was redesigned in place with four metric cards and four native charts; values remain zero until TEST sync is connected. A revised `google-sheets/Code.gs` reproduces this design for new LIVE dashboards and accepts the upgraded TEST title, but this revision is local and must replace the prior GitHub and Apps Script copies before receiver deployment. No `/exec` endpoint or Vercel Sheets settings have been confirmed yet. Do not treat Sheet sync as active.

## TEST Sheet sync investigation — 26 September 2026, 16:35 SGT

The TEST Apps Script web app URL ends in `/exec`; the same script has the revised dashboard code and a 32+ character secret in Script Properties. Vercel Preview has GREEKEE_ENVIRONMENT=TEST, SHEETS_SYNC_URL, and SHEETS_SYNC_SECRET; deployment `dpl_CkQ4U6QzkLkXLR5vjaqRAXYR7911` on `greekee-order-preview` is READY and `/api/config` returned `sheets_configured=true`.

Order GK-B498EDB70F6B (TEST - Sheets Sync, $25.60, three bowl lines including add-ons) saved in Greekee-Test with revision 1 and synced_revision 0. No matching order exists in production. The TEST order tab still has only headers, and the dashboard still shows zero. Supabase has a generic last_sync_error; it does not establish a cause. Bobby's Apps Script Executions screenshot shows only the successful `setupGreekeeSync` run at 13:48:57 SGT, with no `doPost` execution around the 16:31 SGT order. Next inspect the deployed web app access/version and make a signed retry after resolving the path. Do not create duplicate test orders; the pending one can be retried from the staff dashboard.

Latest local code and docs after the first full GitHub upload: `google-sheets/Code.gs` (visual dashboard generator), `tests/sheets.test.js` (dashboard test), `START_HERE.md` and this register. They must be uploaded to the same preview branch; the Apps Script editor was separately updated by Bobby. Production main remains untouched.
