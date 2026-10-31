import { formatSubscriptionDate } from '../features/subscription/api.js';

export function SubscriptionGraceBanner({
  row,
  onManage,
  onViewAccount,
  busy,
  onDismiss,
}) {
  if (!row?.cancel_at_period_end) return null;
  const when = formatSubscriptionDate(row.current_period_end);

  return (
    <aside
      aria-label="Subscription status"
      className="mb-8 flex flex-col gap-4 border-l-2 border-peach bg-cream p-4 text-[13px] leading-[1.6] text-ink sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="flex flex-col gap-1">
        <p className="text-[9px] font-semibold tracking-[0.14em] text-peach uppercase">
          Subscription ending
        </p>
        <p className="font-serif text-[18px] leading-[1.3] text-ink">
          {when
            ? `Your subscription ends on ${when}. You can still add moments until then.`
            : 'Your subscription is set to end. You can still add moments until then.'}
        </p>
        <p className="text-[12px] text-muted">
          Your archive stays permanently safe and readable. No further charges will be made.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-forest px-4 text-[13px] text-white hover:bg-deep disabled:cursor-wait disabled:opacity-60"
          onClick={onManage}
          disabled={Boolean(busy)}
        >
          {busy === 'portal' ? 'Opening settings…' : 'Resume subscription'}
        </button>
        {onViewAccount ? (
          <button
            type="button"
            className="text-[13px] text-ink underline decoration-peach underline-offset-[4px] hover:text-forest"
            onClick={onViewAccount}
          >
            Subscription details
          </button>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-forest"
            onClick={onDismiss}
            aria-label="Dismiss subscription reminder"
          >
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        ) : null}
      </div>
    </aside>
  );
}
