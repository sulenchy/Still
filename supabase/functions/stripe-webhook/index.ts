import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@23.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
});

const admin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function idOf(value) {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id ?? null;
}

function periodEnd(subscription) {
  const unix = subscription.items?.data?.[0]?.current_period_end
    ?? subscription.current_period_end
    ?? null;
  return unix ? new Date(unix * 1000).toISOString() : null;
}

async function findOwner(subscription, hintedUserId) {
  const subscriptionId = subscription.id;
  const customerId = idOf(subscription.customer);

  const bySubscription = await admin
    .from('subscriptions')
    .select('archive_id, owner_id')
    .eq('provider_subscription_id', subscriptionId)
    .maybeSingle();
  if (bySubscription.error) throw bySubscription.error;
  if (bySubscription.data) return bySubscription.data;

  if (customerId) {
    const byCustomer = await admin
      .from('subscriptions')
      .select('archive_id, owner_id')
      .eq('provider_customer_id', customerId)
      .maybeSingle();
    if (byCustomer.error) throw byCustomer.error;
    if (byCustomer.data) return byCustomer.data;
  }

  const userId = hintedUserId || subscription.metadata?.user_id || null;
  if (!userId) return null;

  const archive = await admin
    .from('archives')
    .select('id, owner_id')
    .eq('owner_id', userId)
    .maybeSingle();
  if (archive.error) throw archive.error;
  if (!archive.data) return null;
  return { archive_id: archive.data.id, owner_id: archive.data.owner_id };
}

async function syncSubscription(subscription, hintedUserId) {
  const owner = await findOwner(subscription, hintedUserId);
  if (!owner) {
    throw new Error(`No archive for subscription ${subscription.id}`);
  }

  const saved = await admin.from('subscriptions').upsert({
    archive_id: owner.archive_id,
    owner_id: owner.owner_id,
    provider: 'stripe',
    provider_customer_id: idOf(subscription.customer),
    provider_subscription_id: subscription.id,
    status: subscription.status,
    price_id: subscription.items?.data?.[0]?.price?.id ?? null,
    current_period_end: periodEnd(subscription),
    cancel_at_period_end: subscription.cancel_at_period_end === true,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'archive_id' });
  if (saved.error) throw saved.error;
}

async function subscriptionFromId(subscriptionId) {
  if (!subscriptionId) return null;
  return stripe.subscriptions.retrieve(subscriptionId);
}

async function subscriptionFromInvoice(invoice) {
  const subscriptionId = idOf(invoice.subscription)
    ?? idOf(invoice.parent?.subscription_details?.subscription);
  return subscriptionFromId(subscriptionId);
}

async function subscriptionFromCharge(charge) {
  const invoiceId = idOf(charge.invoice);
  if (invoiceId) {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return subscriptionFromInvoice(invoice);
  }

  const paymentIntentId = idOf(charge.payment_intent);
  if (!paymentIntentId) return null;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const invoiceFromIntent = idOf(paymentIntent.invoice);
  if (!invoiceFromIntent) return null;
  const invoice = await stripe.invoices.retrieve(invoiceFromIntent);
  return subscriptionFromInvoice(invoice);
}

async function fulfillCheckout(session) {
  if (session.mode !== 'subscription') return;
  if (session.payment_status === 'unpaid') return;
  const subscription = await subscriptionFromId(idOf(session.subscription));
  if (!subscription) throw new Error(`Checkout ${session.id} has no subscription`);
  await syncSubscription(subscription, session.client_reference_id);
}

async function refreshResolved(subscription) {
  if (!subscription) return;
  await syncSubscription(subscription, null);
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const signature = request.headers.get('stripe-signature');
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!signature || !secret) {
    return json({ error: 'Missing webhook signature.' }, 400);
  }

  const body = await request.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      secret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    );
  } catch {
    return json({ error: 'Invalid webhook signature.' }, 400);
  }

  try {
    const object = event.data.object;
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await fulfillCheckout(object);
        break;
      case 'checkout.session.async_payment_failed':
        await refreshResolved(await subscriptionFromId(idOf(object.subscription)));
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(object, null);
        break;
      case 'invoice.paid':
      case 'invoice.payment_failed':
        await refreshResolved(await subscriptionFromInvoice(object));
        break;
      case 'charge.dispute.created': {
        const charge = typeof object.charge === 'string'
          ? await stripe.charges.retrieve(object.charge)
          : object.charge;
        await refreshResolved(await subscriptionFromCharge(charge));
        break;
      }
      case 'charge.refunded':
        await refreshResolved(await subscriptionFromCharge(object));
        break;
      case 'radar.early_fraud_warning.created':
        if (object.charge) {
          const charge = typeof object.charge === 'string'
            ? await stripe.charges.retrieve(object.charge)
            : object.charge;
          await refreshResolved(await subscriptionFromCharge(charge));
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(event.type, error?.message || error);
    return json({ error: 'Webhook handler failed.' }, 500);
  }

  return json({ received: true }, 200);
});
