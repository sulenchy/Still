-- One membership per archive. Stripe writes it through the webhook.
-- The browser can read its own row and cannot change the status.

begin;

create table public.memberships (
  archive_id uuid primary key references public.archives (id) on delete cascade,
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  status text not null,
  price_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now(),
  constraint memberships_provider_subscription_key unique (provider_subscription_id)
);

alter table public.memberships enable row level security;
alter table public.memberships force row level security;

revoke all on public.memberships from public, anon;
grant select on public.memberships to authenticated;
grant select, insert, update, delete on public.memberships to service_role;

create policy memberships_select
  on public.memberships
  for select
  to authenticated
  using (owner_id = auth.uid());

commit;
