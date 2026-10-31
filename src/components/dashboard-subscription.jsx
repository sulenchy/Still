import { primaryButton } from '../constants/class-names.js';
import { paperCard } from './dashboard-shell.jsx';
import {
  canStartCheckout,
  planName,
  subscriptionSummary,
} from '../features/subscription/api.js';

const quietButton = 'inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-ink disabled:cursor-wait disabled:opacity-60';

function Offer({ restarting, busy, onCheckout }) {
  return (
    <>
      <p className="text-[14px] leading-[1.7] text-muted">
        {restarting
          ? 'The trial on this archive has already been used. A year is 220,000 Naira. A month is 20,000 Naira.'
          : 'A 14-day card trial is how this archive begins. The card is collected now, and the first payment waits until the trial ends. A year is 220,000 Naira, which saves one month against 20,000 Naira a month.'}
      </p>
      <div className="flex flex-col items-start gap-3">
        <button
          type="button"
          className={`${primaryButton} disabled:cursor-wait disabled:opacity-60`}
          onClick={() => onCheckout('year')}
          disabled={Boolean(busy)}
        >
          {busy === 'year' ? 'Opening yearly checkout…' : (restarting ? 'Start yearly again' : 'Start the yearly trial')}
        </button>
        <button
          type="button"
          className={quietButton}
          onClick={() => onCheckout('month')}
          disabled={Boolean(busy)}
        >
          {busy === 'month' ? 'Opening monthly checkout…' : (restarting ? 'Start monthly again' : 'Start the monthly trial')}
        </button>
      </div>
    </>
  );
}

export function DashboardSubscription({
  row,
  loadStatus,
  error,
  confirming,
  returnKind,
  busy,
  actionError,
  onCheckout,
  onManage,
  onRetry,
}) {
  const open = row?.status === 'active' || row?.status === 'trialing';
  const showCheckout = loadStatus === 'ready' && !confirming && canStartCheckout(row);
  const showManage = Boolean(row?.provider_customer_id) && !confirming;

  let body = null;
  if (loadStatus === 'loading' || confirming) {
    body = (
      <p role="status" className="text-[14px] leading-[1.7] text-muted">
        {confirming
          ? 'Confirming your subscription. This page waits until it is recorded. The return link alone does not start it.'
          : 'Checking your subscription.'}
      </p>
    );
  } else if (loadStatus === 'failed') {
    body = (
      <div className="flex flex-col items-start gap-4">
        <p role="alert" className="text-[14px] leading-[1.7] font-medium text-error">
          {error || 'Could not load the subscription.'}
        </p>
        <button type="button" className={quietButton} onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col gap-5">
        {returnKind === 'cancelled' && !row ? (
          <p role="status" className="text-[14px] leading-[1.7] text-muted">No charge was made.</p>
        ) : null}
        {returnKind === 'success' && !open ? (
          <p role="status" className="text-[14px] leading-[1.7] text-muted">
            Checkout is not confirmed yet. If you finished it, wait a moment and try again.
          </p>
        ) : null}
        {row ? (
          <div>
            <p className="text-[9px] tracking-[0.12em] text-peach uppercase">
              {open ? planName(row.price_id) : 'Status'}
            </p>
            <p className="mt-2 text-[14px] leading-[1.7]">{subscriptionSummary(row)}</p>
          </div>
        ) : null}
        {showCheckout ? (
          <Offer restarting={Boolean(row)} busy={busy} onCheckout={onCheckout} />
        ) : null}
        {showManage ? (
          <button
            type="button"
            className={open ? `${primaryButton} self-start disabled:cursor-wait disabled:opacity-60` : `${quietButton} self-start`}
            onClick={onManage}
            disabled={Boolean(busy)}
          >
            {busy === 'portal' ? 'Opening subscription settings…' : 'Manage subscription'}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <section className={`${paperCard} flex flex-col gap-4`} aria-labelledby="subscription-title">
      <h2 id="subscription-title" className="font-serif text-[40px] leading-[1.05] font-normal">
        The subscription.
      </h2>
      {body}
      {actionError ? (
        <p role="alert" className="text-[13px] leading-[1.6] font-medium text-error">{actionError}</p>
      ) : null}
    </section>
  );
}
