-- "Membership" is reserved for a family member's access.
-- The paid Stripe plan is a subscription.

begin;

alter table public.memberships rename to subscriptions;

alter table public.subscriptions
  rename constraint memberships_pkey to subscriptions_pkey;

alter table public.subscriptions
  rename constraint memberships_owner_id_key to subscriptions_owner_id_key;

alter table public.subscriptions
  rename constraint memberships_provider_subscription_key to subscriptions_provider_subscription_key;

alter table public.subscriptions
  rename constraint memberships_archive_id_fkey to subscriptions_archive_id_fkey;

alter table public.subscriptions
  rename constraint memberships_owner_id_fkey to subscriptions_owner_id_fkey;

alter policy memberships_select on public.subscriptions rename to subscriptions_select;

commit;
