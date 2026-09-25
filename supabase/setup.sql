-- Greekee initial setup. Run once in the SQL Editor of your EMPTY Greekee project.
-- No customer/order access is granted to browser roles. All access goes through
-- the Vercel API, which verifies the Supabase user AND active staff membership.
begin;
create table if not exists public.greekee_staff (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null,
 locations text[] not null default array['Punggol','Hougang'],
 active boolean not null default true,
 check (cardinality(locations)>0 and locations <@ array['Punggol','Hougang']::text[])
);
create table if not exists public.greekee_orders (
 id uuid primary key default gen_random_uuid(),
 order_number text not null unique default ('GK-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 request_key uuid not null unique,
 request_hash text not null,
 customer_name text not null, phone text not null,
 location text not null check (location in ('Punggol','Hougang')),
 fulfillment text not null check (fulfillment in ('pickup','delivery')),
 delivery_region text not null default '', delivery_area text not null default '', address text not null default '',
 order_date date not null, fulfillment_date date not null, pickup_slot timestamptz,
 source text not null, point_of_contact text not null default '', notes text not null default '',
 items jsonb not null check (jsonb_typeof(items)='array' and jsonb_array_length(items)>0),
 subtotal_cents integer not null check(subtotal_cents>=0),
 discount_cents integer not null default 0 check(discount_cents>=0 and discount_cents<=subtotal_cents),
 adjustment_reason text not null default '',
 delivery_fee_cents integer not null default 0 check(delivery_fee_cents>=0),
 total_cents integer not null check(total_cents=subtotal_cents-discount_cents+delivery_fee_cents),
 order_status text not null default 'pending' check(order_status in ('pending','confirmed','preparing','ready','completed','cancelled')),
 payment_status text not null default 'unpaid' check(payment_status in ('unpaid','paid','refunded')),
 payment_checked_by uuid references auth.users(id), payment_checked_at timestamptz,
 created_by uuid references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 revision integer not null default 1, synced_revision integer not null default 0,
 last_sync_error text, synced_at timestamptz
);
create index if not exists greekee_orders_location_due on public.greekee_orders(location,fulfillment_date);
create index if not exists greekee_orders_created on public.greekee_orders(created_at desc,id desc);
create index if not exists greekee_orders_unsynced on public.greekee_orders(updated_at) where revision>synced_revision;
create index if not exists greekee_orders_created_by on public.greekee_orders(created_by);
create index if not exists greekee_orders_payment_checked_by on public.greekee_orders(payment_checked_by);
create table if not exists public.greekee_order_events (
 id bigint generated always as identity primary key,
 order_id uuid not null references public.greekee_orders(id),
 actor_id uuid not null references auth.users(id), actor_name text not null,
 changed_at timestamptz not null default now(), changes jsonb not null
);
create index if not exists greekee_order_events_order on public.greekee_order_events(order_id,changed_at desc);
create index if not exists greekee_order_events_actor on public.greekee_order_events(actor_id);
create table if not exists public.greekee_rate_limits (
 key text primary key, window_start timestamptz not null, hits integer not null
);
alter table public.greekee_staff enable row level security;
alter table public.greekee_orders enable row level security;
alter table public.greekee_order_events enable row level security;
alter table public.greekee_rate_limits enable row level security;
revoke all on public.greekee_staff,public.greekee_orders,public.greekee_order_events,public.greekee_rate_limits from public,anon,authenticated;
grant select,insert,update,delete on public.greekee_staff,public.greekee_orders,public.greekee_order_events,public.greekee_rate_limits to service_role;
grant usage,select on sequence public.greekee_order_events_id_seq to service_role;

create index if not exists greekee_rate_limits_expiry on public.greekee_rate_limits(window_start);

create or replace function public.greekee_rate_limit(p_key text,p_max integer,p_seconds integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.greekee_rate_limits as r(key,window_start,hits) values(p_key,now(),1)
 on conflict(key) do update set
 hits=case when r.window_start < now()-make_interval(secs=>p_seconds) then 1 else r.hits+1 end,
 window_start=case when r.window_start < now()-make_interval(secs=>p_seconds) then now() else r.window_start end
 returning hits into n;
 delete from public.greekee_rate_limits where window_start<now()-interval '2 days';
 return n<=p_max;
end $$;
revoke all on function public.greekee_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.greekee_rate_limit(text,integer,integer) to service_role;

create or replace function public.greekee_update_order(p_id uuid,p_revision integer,p_actor uuid,p_patch jsonb)
returns public.greekee_orders language plpgsql security invoker set search_path='' as $$
declare old public.greekee_orders; result public.greekee_orders; staff public.greekee_staff; delta jsonb;
begin
 select * into staff from public.greekee_staff where user_id=p_actor and active;
 if not found then raise exception 'not_authorized';end if;
 select * into old from public.greekee_orders where id=p_id for update;
 if not found or not (old.location=any(staff.locations)) then raise exception 'not_authorized';end if;
 if old.revision<>p_revision then raise exception 'revision_conflict';end if;
 if exists(select 1 from jsonb_object_keys(p_patch) as k where k not in ('order_status','payment_status','notes','fulfillment_date','pickup_slot','customer_name','phone','address')) then raise exception 'invalid_patch';end if;
 if p_patch->>'payment_status'='refunded' and old.payment_status not in ('paid','refunded') then raise exception 'refund_requires_paid';end if;
 update public.greekee_orders set
 order_status=coalesce(p_patch->>'order_status',old.order_status),
 payment_status=coalesce(p_patch->>'payment_status',old.payment_status),
 notes=coalesce(p_patch->>'notes',old.notes),
 customer_name=coalesce(p_patch->>'customer_name',old.customer_name),
 phone=coalesce(p_patch->>'phone',old.phone),
 address=coalesce(p_patch->>'address',old.address),
 fulfillment_date=coalesce((p_patch->>'fulfillment_date')::date,old.fulfillment_date),
 pickup_slot=case when p_patch ? 'pickup_slot' then (p_patch->>'pickup_slot')::timestamptz else old.pickup_slot end,
 payment_checked_by=case when p_patch ? 'payment_status' and p_patch->>'payment_status'<>old.payment_status then p_actor else old.payment_checked_by end,
 payment_checked_at=case when p_patch ? 'payment_status' and p_patch->>'payment_status'<>old.payment_status then now() else old.payment_checked_at end,
 revision=old.revision+1,updated_at=now(),last_sync_error=null
 where id=p_id returning * into result;
 select coalesce(jsonb_object_agg(k,jsonb_build_object('before',to_jsonb(old)->k,'after',to_jsonb(result)->k)),'{}'::jsonb)
 into delta from jsonb_object_keys(p_patch) as k where to_jsonb(old)->k is distinct from to_jsonb(result)->k;
 insert into public.greekee_order_events(order_id,actor_id,actor_name,changes) values(p_id,p_actor,staff.display_name,delta);
 return result;
end $$;
revoke all on function public.greekee_update_order(uuid,integer,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.greekee_update_order(uuid,integer,uuid,jsonb) to service_role;
-- Private service-only retry queue; do not grant browser roles access.
create or replace view public.greekee_unsynced_orders with (security_invoker=true) as
 select * from public.greekee_orders where revision>synced_revision;
revoke all on public.greekee_unsynced_orders from public,anon,authenticated;
grant select on public.greekee_unsynced_orders to service_role;

notify pgrst, 'reload schema';
commit;
