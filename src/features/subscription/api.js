import supabase from '../../lib/supabase.js';

const openStatuses = new Set(['active', 'trialing']);
const cardStatuses = new Set(['past_due', 'unpaid', 'incomplete', 'paused']);

export function subscriptionIsOpen(row) {
  return openStatuses.has(row?.status);
}

export function canStartCheckout(row) {
  if (!row) return true;
  if (subscriptionIsOpen(row)) return false;
  return !cardStatuses.has(row.status);
}

export function planName(priceId) {
  const yearly = import.meta.env.VITE_STRIPE_PRICE_YEARLY;
  const monthly = import.meta.env.VITE_STRIPE_PRICE_MONTHLY;
  if (yearly && priceId === yearly) return 'Yearly';
  if (monthly && priceId === monthly) return 'Monthly';
  return 'Still';
}

export function formatSubscriptionDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function subscriptionSummary(row) {
  if (!row) return '';
  const when = formatSubscriptionDate(row.current_period_end);
  const plan = planName(row.price_id);

  if ((row.status === 'trialing' || row.status === 'active') && row.cancel_at_period_end) {
    return when
      ? `${plan}. It ends on ${when}. You can still add to the archive until then.`
      : `${plan}. It is set to end.`;
  }
  if (row.status === 'trialing') {
    return when
      ? `${plan} trial. The first payment is on ${when}.`
      : `${plan} trial is underway.`;
  }
  if (row.status === 'active') {
    return when
      ? `${plan}. It renews on ${when}.`
      : `${plan} subscription is active.`;
  }
  if (row.status === 'past_due' || row.status === 'unpaid') {
    return 'The last payment did not go through. The archive stays readable. Update the card to add something new.';
  }
  if (row.status === 'canceled' || row.status === 'incomplete_expired') {
    return 'This subscription has ended. The archive stays readable. Start again to add a moment or invite someone.';
  }
  return 'This subscription is not active. The archive stays readable. New moments and invitations wait until it is.';
}

async function invokeMessage(error, fallback) {
  const response = error?.context;
  if (response && typeof response.json === 'function') {
    try {
      const body = await response.json();
      if (typeof body?.error === 'string' && body.error) return body.error;
    } catch {
      // The function body was not JSON.
    }
  }
  return fallback;
}

export async function loadSubscription() {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, price_id, current_period_end, provider_customer_id, cancel_at_period_end')
    .maybeSingle();
  if (error) throw new Error('Could not load the subscription.');
  return data;
}

export async function startCheckout(interval) {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: { interval: interval === 'year' ? 'year' : 'month' },
  });
  if (error) throw new Error(await invokeMessage(error, 'Could not start checkout.'));
  if (!data?.url) throw new Error('Could not start checkout.');
  window.location.assign(data.url);
}

export async function openPortal() {
  const { data, error } = await supabase.functions.invoke('create-portal-session', {
    body: {},
  });
  if (error) throw new Error(await invokeMessage(error, 'Could not open subscription settings.'));
  if (!data?.url) throw new Error('Could not open subscription settings.');
  window.location.assign(data.url);
}
