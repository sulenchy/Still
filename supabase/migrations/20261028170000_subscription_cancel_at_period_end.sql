-- The account screen reads this so a scheduled cancellation does not
-- still look like a renewal. The webhook is the only writer.

begin;

alter table public.subscriptions
  add column cancel_at_period_end boolean not null default false;

notify pgrst, 'reload schema';

commit;
