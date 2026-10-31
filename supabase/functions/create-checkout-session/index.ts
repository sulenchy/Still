import Stripe from 'npm:stripe@23.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
});

const prices = {
  month: Deno.env.get('STRIPE_PRICE_MONTHLY') ?? '',
  year: Deno.env.get('STRIPE_PRICE_YEARLY') ?? '',
};

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://still-rg7h.onrender.com',
]);

const corsHeaders = 'authorization, x-client-info, apikey, content-type';

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': corsHeaders,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}

const openStatuses = new Set(['active', 'trialing']);
const cardStatuses = new Set(['past_due', 'unpaid', 'incomplete', 'paused']);

async function billingRow(userId) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Could not check the current subscription.');
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?owner_id=eq.${encodeURIComponent(userId)}&select=status,provider_customer_id`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json',
      },
    },
  );
  if (!response.ok) throw new Error('Could not check the current subscription.');
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] ?? null : null;
}

function integrationIdentifier() {
  const letters = Array.from(crypto.getRandomValues(new Uint8Array(8)), (value) => (
    String.fromCharCode(97 + (value % 26))
  )).join('');
  return `still_checkout_${letters}`;
}

Deno.serve(async (request) => {
  const requestOrigin = request.headers.get('Origin') ?? '';
  const origin = allowedOrigins.has(requestOrigin) ? requestOrigin : 'http://localhost:5173';

  if (request.method === 'OPTIONS') {
    return json({ ok: true }, 200, origin);
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405, origin);
  }

  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authorization || !supabaseUrl || !supabaseAnonKey) {
    return json({ error: 'Sign in to start your subscription.' }, 401, origin);
  }

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: authorization,
      apikey: supabaseAnonKey,
    },
  });
  if (!userResponse.ok) {
    return json({ error: 'Sign in to start your subscription.' }, 401, origin);
  }

  const user = await userResponse.json();
  if (!user?.id || !user?.email) {
    return json({ error: 'Sign in to start your subscription.' }, 401, origin);
  }

  const body = await request.json().catch(() => ({}));
  const interval = body?.interval === 'year' ? 'year' : 'month';
  const price = prices[interval];
  if (!price || !Deno.env.get('STRIPE_SECRET_KEY')) {
    return json({ error: 'Subscription prices are not configured.' }, 500, origin);
  }

  try {
    const existing = await billingRow(user.id);
    if (existing && openStatuses.has(existing.status)) {
      return json({ error: 'This archive already has a subscription. Manage it from your account.' }, 409, origin);
    }
    if (existing && cardStatuses.has(existing.status)) {
      return json({ error: 'Update the card on the current subscription before starting another.' }, 409, origin);
    }

    const subscriptionData = {
      metadata: { user_id: user.id },
      ...(existing ? {} : { trial_period_days: 14 }),
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      client_reference_id: user.id,
      ...(existing?.provider_customer_id
        ? { customer: existing.provider_customer_id }
        : { customer_email: user.email }),
      line_items: [{ price, quantity: 1 }],
      subscription_data: subscriptionData,
      success_url: `${origin}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?checkout=cancelled`,
      integration_identifier: integrationIdentifier(),
    });

    if (!session.url) {
      return json({ error: 'Could not start checkout.' }, 500, origin);
    }
    return json({ url: session.url }, 200, origin);
  } catch (error) {
    console.error(error);
    return json({ error: 'Could not start checkout. Try again in a moment.' }, 500, origin);
  }
});
