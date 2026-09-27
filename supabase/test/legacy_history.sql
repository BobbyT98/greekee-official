-- Applied only to Greekee-Test (mgulbszcffsihvnxmqkm).
-- Q3 source rows are product lines, not complete customer orders.
-- The data itself contains customer names and belongs in Supabase, not GitHub.
create table if not exists public.greekee_legacy_order_lines (
  source_key text primary key check (source_key ~ '^HISTORY:(FIO|CALB):[0-9]+$'),
  source_tab text not null,
  source_row integer not null check (source_row > 0),
  handler text not null check (handler in ('Fiona','Caleb')),
  location text not null check (location in ('Punggol','Hougang')),
  customer_name text,
  product text not null,
  quantity integer check (quantity > 0),
  stage_label text,
  payment_label text,
  order_date date,
  fulfillment_date date,
  line_total_cents integer check (line_total_cents >= 0),
  sales_platform text,
  point_of_contact text,
  notes text,
  imported_at timestamptz not null default now(),
  unique (source_tab, source_row)
);
alter table public.greekee_legacy_order_lines enable row level security;
revoke all on table public.greekee_legacy_order_lines from anon, authenticated;
comment on table public.greekee_legacy_order_lines is
  'TEST-only Q3 2026 legacy product lines. These are not complete or unique customer orders; never feed the active order queue.';
